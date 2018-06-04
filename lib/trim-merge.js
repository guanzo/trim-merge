#!/usr/bin/env node

const trimmerge = require('../src')
const program = require('commander')
const yaml = require('js-yaml')
const fs = require('fs')
const { spawn } = require('child_process')
const children = []
const CLIPS_FILE = 'clips.yml'

program
    .description(
        `Description: Trim and merge videos. You must supply a clips.yml file. Minimal config file example:
        ${configExample()}`
    )
    .usage(`[options]
    Trim & merge:   trim-merge
    Trim only:      trim-merge -t
    Merge only:     trim-merge -m
    Keep clips:     trim-merge -c 1`)
    .option('-i, --input [file]', 'Trim and merge clips from config file', CLIPS_FILE)
    .option('-t, --trim', 'Trim video(s) from config file')
    .option('-m, --merge', 'Merge existing clips from config file')
    .option('-c, --cleanup [int]', '1 to delete clips. 0 to keep clips', 1)
    .option('-d, --debug [int]', 'Output commands & resolved config file')
    .parse(process.argv)

let { merge, trim } = program

// You can specify no flags (preferred), or both flags, e.g. -mt
let TRIM_AND_MERGE = (!trim && !merge) || (trim && merge)

let DO_TRIM = TRIM_AND_MERGE || trim
let DO_MERGE = TRIM_AND_MERGE || merge
let TRIM_ONLY = trim && !merge
//let MERGE_ONLY = merge && !trim
let DELETE_CLIPS = parseInt(program.cleanup) !== 0
let DEBUG = program.debug

init(program.input)

async function init(file) {
    try {
        let doc = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
        doc = trimmerge.parseConfig(doc)
        if (DEBUG) {
            fs.writeFileSync('config.json', JSON.stringify(doc, null, 4))
        }
        
        let p = doc.clips.map(async option => {
            if (DO_TRIM) {
                await Promise.all(option.clips.map(c => trimClip(option, c)))
                if (TRIM_ONLY)
                    return
            }
            if (DO_MERGE && option.clips.length > 1) {
                await mergeClips(option)
                if (DELETE_CLIPS) {
                    trimmerge.deleteClips(option)
                }
            }

        })
        await Promise.all(p)

        if (DO_MERGE && doc.clips.length > 1) {
            await mergeClips(doc)
            if (DELETE_CLIPS) {
                trimmerge.deleteClips(doc)
            }
        }
    } catch (e) {
        console.log(e)
    } finally {
        process.exit()
    }
}

async function trimClip(videoOption, clipOption) {
    let args = trimmerge.createTrimArgs(videoOption, clipOption)
    log(`command: ffmpeg ${args.join(' ')}`)

    return new Promise(res=> {
        let child = spawn('ffmpeg', args)
        children.push(child)
        child.on('close', res)
        child.on('error', console.log)
        child.stderr.pipe(process.stderr)
    })
}

async function mergeClips(option) {
    trimmerge.createConcatFile(option)
    let args = trimmerge.createConcatArgs(option)
    log(`command: ffmpeg ${args.join(' ')}`)
    return new Promise(res=> {
        let child = spawn('ffmpeg', args)
        children.push(child)
        child.on('close', () => {
            trimmerge.deleteConcatFile(option.concat)
            res()
        })
        child.on('error', console.log)
        child.stderr.pipe(process.stderr)
        //child.stdout.pipe(process.stdout)
    })
}

function log(text) {
    if (DEBUG)
        console.log(text + '\n')
}

function configExample() {
    return `
    clips:
      - input: video.mp4
        clips:
          - time: 00:05-00:10
          - time: 00:20-00:30
    `
}

process.on('SIGINT', function() {
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
    process.exit()
})

if (process.platform === "win32") { 
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    })
  
    rl.on("SIGINT", function () {
        process.emit("SIGINT")
    })
}
