const moment = require('moment')
const fs = require('fs')
const path = require('path')
const CONCAT_FILE = 'concat.txt'
const MERGE_FILE = 'merged.mp4'

function createTrimArgs(videoOption, clipOption) {
    let { input, resolution } = videoOption
    let { output, start, duration } = clipOption
    let args = [
        '-y', // Overwrite existing file without asking
        '-loglevel', 'error',
        `-ss`, start,
        `-i`, input,
        `-avoid_negative_ts`, 'make_zero'
    ]
    if (duration) { // If no duration, it trims to end of file
        args.push(...['-t', duration])
    }
    if (resolution) {
        args.push(...[
            `-vf`, `scale=${resolution}`,
            '-async', '1'
        ])
    } else {
        args.push(...['-c', 'copy'])
    }
    args.push(output)
    return args
}

function createConcatArgs(video) {
    let args = [
        '-y', // Overwrite existing file without asking
        '-loglevel', 'error',
        '-f', 'concat',
        '-safe', '0',
        '-i', video.concat,
        '-c', 'copy',
        video.output
    ]
    return args
}

function createConcatFile(option) {
    let data = option.clips.map(c => `file '${c.output}' \n`).join('')
    fs.writeFileSync(option.concat, data)
}

function deleteConcatFile(file) {
    fs.unlinkSync(file)
}

function parseConfig(option) {
    option = parseConfigFileOptions(option)
    option.clips = option.clips.map(parseVideoOptions)
    return option
}

function parseConfigFileOptions(config) {
    let { output } = config
    if (!output)
        output = MERGE_FILE
    if (!output.endsWith('.mp4'))
        output += '.mp4'
    let concat = output + ' - ' + CONCAT_FILE
    config = {
        ...config,
        output,
        concat
    }
    return config
}

function parseVideoOptions(video) {
    let { output, clips } = video
    clips = clips.map((c, i) => parseClipOptions(c, i, video))
    if (clips.length === 1) {
        output = clips[0].output
    } else {
        if (!output)
            output = createMergeName(video)
        if (!output.endsWith('.mp4'))
            output += '.mp4'
    }
    let concat = output + ' - ' + CONCAT_FILE
    video = {
        ...video,
        clips,
        output,
        concat
    }
    return video
}

function parseClipOptions(clip, index, video) {
    let { output } = clip
    if (!output) 
        output = createClipName(clip, index, video)
    if (typeof output !== String)
        output = String(output)
    if (!output.endsWith('.mp4'))
        output += '.mp4'
    clip = {
        ...clip,
        output,
        ...parseTimespan(clip.time)
    }
    return clip
}

function createMergeName(video) {
    let { input } = video
    let ext = path.extname(input)
    let filename = path.basename(input, ext)
    return filename + ' - merged'  + ext
}

function createClipName(clip, index, video) {
    let { input } = video
    let ext = path.extname(input)
    let filename = path.basename(input, ext)
    return filename + ' - clip ' + index + ext
}

function deleteClips(option) {
    option.clips.forEach(c => {
        fs.unlinkSync(c.output)
    })
}

function parseTimespan(timespan) {
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
    createTrimArgs,
    createConcatArgs,
    createConcatFile,
    deleteConcatFile,
    deleteClips,
    parseTime,
    parseTimespan
}