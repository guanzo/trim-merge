
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

module.exports = {
    createTrimArgs,
    createConcatArgs
}