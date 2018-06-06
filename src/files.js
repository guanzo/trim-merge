const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

let configDirectory = ''

// All inputs and outputs are relative to the config file.
function getWorkingDirectory(output) {
    return path.join(configDirectory, output)
}

function getConfigFile(file) {
    if (fs.existsSync(file)) {
        configDirectory = path.dirname(file)
        return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    } else {
        throw Error('Config file not found: ' + file)
    }
}

function createConcatFile(option) {
    let data = option.clips.map(c => `file '${c.output}' \n`).join('')
    fs.writeFileSync(option.concat, data)
}

function deleteConcatFile(file) {
    fs.unlinkSync(file)
}

function deleteClips(option) {
    option.clips.forEach(c => {
        fs.unlinkSync(c.output)
    })
}

function createResolvedConfigFile(doc) {
    let filepath = getWorkingDirectory('resolved-config.json')
    fs.writeFileSync(filepath, JSON.stringify(doc, null, 4))
}

module.exports = {
    getWorkingDirectory,
    getConfigFile,
    createConcatFile,
    deleteConcatFile,
    deleteClips,
    createResolvedConfigFile
}