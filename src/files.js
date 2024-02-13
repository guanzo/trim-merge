const fs = require('fs')
const yaml = require('js-yaml')
const path = require('path')

let configDirectory = ''

// All inputs and outputs are relative to the config file.
function getWorkingDirectory(inputFile) {
    return path.join(configDirectory, inputFile)
}

// Sometimes the file is nested in a directory. The config file can optionally only
// specify the filename, in which case we check each directory to see if it contains the file.
function findInputFile(inputFile) {
    const files = fs.readdirSync(configDirectory)
    for (const file of files) {
        const filePath = path.join(configDirectory, file);
        const stats = fs.statSync(filePath);

        if (!stats.isDirectory()) {
            continue
        }

        const inputFilepath = path.join(filePath, inputFile)
        if (fs.existsSync(inputFilepath)) {
            return inputFilepath
        }
    }

    return null
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

module.exports = {
    getWorkingDirectory,
    findInputFile,
    getConfigFile,
    createConcatFile,
    deleteConcatFile,
    deleteClips,
}
