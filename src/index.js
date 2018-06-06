
const { spawn } = require('child_process')

const parser = require('./parser')
const files = require('./files')
const args = require('./args')

let DEBUG
const children = []

async function start(cmd) {
    DEBUG = cmd.DEBUG
    
    let doc = files.getConfigFile(cmd.input)
    doc = parser.parseConfig(doc)
    
    if (DEBUG) {
        files.createResolvedConfigFile(doc)
    }
    
    // Trim && merge input videos
    let p = doc.clips.map(async option => {
        if (cmd.DO_TRIM) {
            await trimClips(option)
            if (cmd.ONLY_TRIM)
                return
        }
        await doMerge(cmd, option)
    })
    await Promise.all(p)
    // Merge all clips
    await doMerge(cmd, doc)
}

async function trimClips(option) {
    let trims = option.clips
        .filter(clip => clip.time)
        .map(clip => {
            let trimArgs = args.createTrimArgs(option, clip)
            log(`trim command: ffmpeg ${trimArgs.join(' ')}`, )
            return trimClip(trimArgs)
        })
    return Promise.all(trims)
}

async function trimClip(trimArgs) {
    return new Promise(res=> {
        let child = spawn('ffmpeg', trimArgs)
        child.on('close', res)
        child.on('error', console.log)
        child.stderr.pipe(process.stderr)

        children.push(child)
    })
}

async function doMerge(cmd, option) {
    if (cmd.DO_MERGE && option.clips.length > 1) {
        await mergeClips(option)
        if (!cmd.KEEP_CLIPS) {
            files.deleteClips(option)
        }
    }
}

async function mergeClips(option) {
    files.createConcatFile(option)
    let concatArgs = args.createConcatArgs(option)
    log(`merge command: ffmpeg ${concatArgs.join(' ')}`)
    return new Promise(res=> {
        let child = spawn('ffmpeg', concatArgs)
        child.on('close', () => {
            files.deleteConcatFile(option.concat)
            res()
        })
        child.on('error', console.log)
        child.stderr.pipe(process.stderr)
        //child.stdout.pipe(process.stdout)
        
        children.push(child)
    })
}

function killChildren() {
    children.forEach(c => {
        if (process.platform === "win32") {
            let taskkill = spawn("taskkill", ["/pid", c.pid, '/f', '/t'])
            taskkill.on('close', console.log)
            taskkill.on('error', console.log)
            taskkill.stderr.pipe(process.stderr)
            taskkill.stdout.pipe(process.stdout)
        } else {
            c.kill()
        }
    })
}

function log(text) {
    if (DEBUG)
        console.log(text + '\n')
}

module.exports = {
    start,
    killChildren
}