// srcpath
const __srcpath = __dirname.replace("\\routes", "")

// imports
const express = require("express")
const router = express.Router()
const path = require("path")
const fs = require("fs")

// endpoint cdn
router.get("/:filename", (req, res) => {
    return res.status(200).contentType("image/jpg").send(fs.readFileSync(path.join(__srcpath, "cdn", req.params.filename)));
})

// exports
module.exports = router
