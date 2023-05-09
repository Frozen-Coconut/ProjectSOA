// srcpath
const __srcpath = __dirname

// utilities
const fileUtil = require(__srcpath + "/utilities/file.js")

// imports
require('dotenv').config()
const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/api", require(__srcpath + "/routes/api.js"))
app.use("/cdn", require(__srcpath + "/routes/cdn.js"))
const path = require("path")

// start
app.listen(process.env.PORT, () => {
    console.log(`Server started at ${process.env.URL}`)
    fileUtil.mkdirIfNotExists(path.join(__srcpath, "uploads"))
    fileUtil.mkdirIfNotExists(path.join(__srcpath, "cdn"))
})
