const fs = require('fs')
const moment = require('moment')
const path = require('path')
let { getWorkingDirectory, findInputFile } = require('./files')

const CONCAT_FILE = 'concat.txt'
const MERGE_FILE = 'merged.mp4'

function parseConfig(option) {
    option = parseConfigFile(option)
    const clips = option.clips.filter(c => !c.skip).map(parseVideoOptions)
    option.clips = clips

    if (option.clips.length === 1) {
        option.output = getOutput(option.clips[0].output)
    }
    return option
}

function parseConfigFile(config) {
    let { output = '' } = config
    output = getOutput(output, MERGE_FILE)
    let concat = output + ' - ' + CONCAT_FILE
    return {
        ...config,
        output,
        concat
    }
}

function parseVideoOptions(video) {
    let { input = '', output = '', clips } = video
    input = getWorkingDirectory(input)
    if (!fs.existsSync(input)) {
        input = findInputFile(input)
    }
    if (!fs.existsSync(input)) {
        throw new Error(`Could not find input: ${input}`)
    }
    clips = clips.filter(c => !c.skip).map((c, i) => parseClipOptions(c, i, input, video))
    if (clips.length === 1) {
        output = getOutput(clips[0].output)
    } else {
        output = getOutput(output, createMergeName(input))
    }

    if (input === output) {
        throw new Error('Input filename cannot equal the output filename')
    }

    return {
        ...video,
        clips,
        input,
        output,
        concat: output + ' - ' + CONCAT_FILE,
    }
}

function parseClipOptions(clip, index, input, video) {
    let { output = '', time } = clip
    if (video.clips.length === 1) {
        output = getOutput(video.output)
    } else {
        output = getOutput(output, createClipName(clip, index, input))
    }
    return {
        ...clip,
        output,
        ...parseTimespan(time)
    }
}

function createMergeName(input) {
    let ext = path.extname(input)
    let filename = path.basename(input, ext)
    return filename + ' - merged'  + ext
}

function createClipName(clip, index, input) {
    let ext = path.extname(input)
    let filename = path.basename(input, ext)
    return filename + ' - clip ' + index + ext
}

function parseTimespan(timespan) {
    // Don't trim clip at all, i.e. it's an existing clip
    if (!timespan) {
        return {}
    }
    timespan = timespan.replace(/\s/g,'')
    let [startTime, endTime] = timespan.split('-').map(parseTime)
    if (!endTime) {
        return {
            start: startTime,
        }
    }
    var start = moment.duration(startTime)
    var end = moment.duration(endTime)
    var duration = end.subtract(start)

    return {
        start: startTime,
        duration: duration.asSeconds()
    }
}
// Get the output file name, create one if not given
// Since setting a clip output is optional
// All outputs are placed in the config files directory
function getOutput(output, defaultOutput) {
    if (!output)
        output = defaultOutput
    if (!path.extname(output))
        output += '.mp4'
    output = getWorkingDirectory(output)
    return output
}

// Add missing time segments
// examples:
// in: 30       out: 00:00:30
// in: 03:30    out: 00:03:30
// in: 01:03:30 out: 01:03:30
function parseTime(time) {
    let segments = time.split(':').map(t => t.padStart(2, "0")) //force 2 digit segment)
    while (segments.length < 3)
        segments.unshift('00')
    return segments.join(':')
}

module.exports = {
    parseConfig,
    parseTime,
    parseTimespan
}
