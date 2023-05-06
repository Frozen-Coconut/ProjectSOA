// srcpath
const __srcpath = __dirname.replace("\\routes", "")

// db
const db = require(__srcpath + "/models/index.js")

// imports
const express = require("express")
const router = express.Router()
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"
const path = require("path")
const fs = require("fs")
const multer = require("multer")
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__srcpath, "uploads"))
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage: diskStorage})
const uuid = require("uuid").v4

// endpoint 16
router.post('/images', async (req, res, next) => {
    let {image, api_key} = req.body
    if (!image) return res.status(400).json({message: "Image is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await db.User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let dir = fs.opendirSync(path.join(__srcpath, "uploads", user.username))
    if (dir.length >= 10) return res.status(400).json({message: "Maximum number of images reached"})
    dir.closeSync()
    req.body.username = user.username
    return next()
}, upload.single("image"), async (req, res) => {
    let username = req.body.username
    let basePath = path.join(__srcpath, "uploads")
    mkdirIfNotExists(basePath)
    mkdirIfNotExists(path.join(basePath, username))
    let id = uuid()
    fs.renameSync(path.join(basePath, req.file.filename), path.join(basePath, id))
    return res.status(200).json({
        message: "Image uploaded successfully",
        id: id
    })
})

// endpoint 17
router.delete("/images/:images_id", async (req, res) => {
    let images_id = req.params.images_id
    let api_key = req.body
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await db.User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let imagePath = path.join(__srcpath, "uploads", user.username, images_id)
    if (!checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
    fs.rmSync(imagePath)
    return res.status(200).json({message: "Image deleted successfully"})
})

// endpoint 18
router.post("/tasks/text-to-image", async (req, res) => {
    let {text, api_key} = req.body
    if (!text) return res.status(400).json({message: "Text is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await db.User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let url = baseUrl + "stabilityai/stable-diffusion-2-1"
    let result
    try {
        result = (await axios.post(url, {inputs: text}, {headers: {"Authorization": "Bearer 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", "Content-Type": "multipart/form-data"}, responseType: "arraybuffer"})).data
    } catch (error) {
        return res.status(400).json({message: "Image generation failed"})
    }
    mkdirIfNotExists(path.join(__srcpath, "cdn"))
    let id = uuid()
    fs.writeFileSync(path.join(__srcpath, "cdn", `${id}.jpg`), result)
    return res.status(200).json({message: "Image generated successfully", url: `${app.get("url")}/cdn/${id}.jpg`})
})

// endpoint 19
router.post("/tasks/image-classification", async (req, res) => {
    let {image_id, api_key} = req.body
    if (!image_id) return res.status(400).json({message: "Image ID is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await db.User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let url = baseUrl + "microsoft/resnet-50"
    let imagePath = path.join(__srcpath, "uploads", user.username, image_id)
    if (!checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
    let image = fs.readFileSync(imagePath)
    let result
    try {
        result = (await axios.post(url, {inputs: image}, {headers: {"Authorization": "Bearer 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", "Content-Type": "multipart/form-data"}, responseType: "arraybuffer"})).data
    } catch (error) {
        return res.status(400).json({message: "Image classification failed"})
    }
    return res.status(200).json({message: "Image classified successfully", data: result})
})

// endpoint 20
router.post("/tasks/image-classification", async (req, res) => {
    let {image_id, api_key} = req.body
    if (!image_id) return res.status(400).json({message: "Image ID is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await db.User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let url = baseUrl + "openmmlab/upernet-convnext-small"
    let imagePath = path.join(__srcpath, "uploads", user.username, image_id)
    if (!checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
    let image = fs.readFileSync(imagePath)
    let result
    try {
        result = (await axios.post(url, {inputs: image}, {headers: {"Authorization": "Bearer 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", "Content-Type": "multipart/form-data"}, responseType: "arraybuffer"})).data
    } catch (error) {
        return res.status(400).json({message: "Image segmentation failed"})
    }
    return res.status(200).json({message: "Image segmented successfully", data: result})
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

// exports
module.exports = router