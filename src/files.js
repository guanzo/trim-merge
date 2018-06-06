const fs = require('fs')
const yaml = require('js-yaml')

function getConfigFile(file) {
    if (fs.existsSync(file)) {
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
    getConfigFile,
    createConcatFile,
    deleteConcatFile,
    deleteClips
}