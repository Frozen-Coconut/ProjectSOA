// srcpath
const __srcpath = __dirname

// imports
const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set("port", 3000)
app.set("url", `http://localhost:${app.get("port")}`)
app.use("/api", require(__srcpath + "/routes/api.js"))
app.use("/cdn", require(__srcpath + "/routes/cdn.js"))
const path = require("path")
const fs = require("fs")

// start
app.listen(app.get("port"), () => {
    console.log(`Server started at ${app.get("url")}`)
    mkdirIfNotExists(path.join(__srcpath, "uploads"))
})

// utilities
function checkIfExists(path) {
    try {
        fs.statSync(path)
    } catch (error) {
        return false
    }
    return true
}
function mkdirIfNotExists(path) {
    if (!checkIfExists(path)) fs.mkdirSync(path)
}
