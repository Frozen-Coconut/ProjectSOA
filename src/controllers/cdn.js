// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// imports
const path = require("path")
const fs = require("fs")

// exports
module.exports = {
    endpointCDN: async (req, res) => {
        return res.status(200).contentType("image/jpg").send(fs.readFileSync(path.join(__srcpath, "cdn", req.params.filename)))
    }
}
