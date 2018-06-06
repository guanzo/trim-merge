#!/usr/bin/env node

const trimmerge = require('../src')
const program = require('commander')
const commandExistsSync = require('command-exists').sync;
const CLIPS_FILE = 'clips.yml'

program
    .description(
        `Description: Trim and merge videos. You must supply a clips.yml file. Minimum clips.yml example:
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
    .option('-k, --keep-clips', 'Prevent deletion of trimmed clips')
    .option('-d, --debug', 'Output ffmpeg commands & resolved config file')
    .parse(process.argv)

let { input, merge, trim, debug, keepClips } = program

// You can specify no flags (preferred), or both flags, e.g. -mt
let TRIM_AND_MERGE = (!trim && !merge) || (trim && merge)

let DO_TRIM = TRIM_AND_MERGE || trim
let DO_MERGE = TRIM_AND_MERGE || merge
let ONLY_TRIM = trim && !merge
//let MERGE_ONLY = merge && !trim
let KEEP_CLIPS = keepClips

const cmd = {
    input,
    TRIM_AND_MERGE,
    DO_TRIM,
    DO_MERGE,
    ONLY_TRIM,
    KEEP_CLIPS,
    DEBUG: debug
}

process.on('SIGINT', () => {
    trimmerge.killChildren()
    process.exit()
})

if (process.platform === "win32") { 
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    })
  
    rl.on("SIGINT", () => {
        process.emit("SIGINT")
    })
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

(async () => {
    if (!commandExistsSync('ffmpeg')) {
        console.log(`trim-merge requires ffmpeg`)
        console.log('1. Install ffmpeg: https://ffmpeg.org/download.html')
        console.log('2. Add ffmpeg to your PATH ')
        console.log('2. Run trim-merge')
        process.exit()
    } 
    try {
        await trimmerge.start(cmd)
    } catch (e) {
        console.log(e)
    } finally {
        process.exit()
    }
})()

