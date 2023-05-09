// imports
const fs = require("fs")

// utilities
const checkIfExists = (path) => {
    try {
        fs.statSync(path)
    } catch (error) {
        return false
    }
    return true
}
const mkdirIfNotExists = (path) => {
    if (!checkIfExists(path)) fs.mkdirSync(path)
}

// exports
module.exports = {
    checkIfExists,
    mkdirIfNotExists
}
