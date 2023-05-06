// sequelize
const Sequelize = require("sequelize")
const sequelize = new Sequelize("project_soa", "root", "", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    logging: false
})
const {Model, DataTypes, Op} = Sequelize

class User extends Model {}
User.init({
    username: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        autoIncrement: false
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    api_key: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: false
})

// relations
// User.hasMany(Order, {foreignKey: "id"})

// sync
let init = async () => {
    await sequelize.sync({force: false})
}
// init()

// express, joi, axios, jwt, path, fs, multer, uuid
const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.set("port", 3000)
const serverUrl = `http://localhost:${app.get("port")}`
const joi = require("joi").extend(require("@joi/date"))
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"
const jwt = require("jsonwebtoken")
const secretKey = "project_soa_6868_6874_6876_6883"
const path = require("path")
const fs = require("fs")
mkdirIfNotExists(path.join(__dirname, "uploads"))
mkdirIfNotExists(path.join(__dirname, "cdn"))
const multer = require("multer")
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"))
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})
const upload = multer({storage: diskStorage})
const uuid = require("uuid").v4

// endpoint 16
app.post('/api/images', async (req, res, next) => {
    let {image, api_key} = req.body
    if (!image) return res.status(400).json({message: "Image is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let dir = fs.opendirSync(path.join(__dirname, "uploads", user.username))
    if (dir.length >= 10) return res.status(400).json({message: "Maximum number of images reached"})
    dir.closeSync()
    req.body.username = user.username
    return next()
}, upload.single("image"), async (req, res) => {
    let username = req.body.username
    let basePath = path.join(__dirname, "uploads", username)
    mkdirIfNotExists(basePath)
    let id = uuid()
    fs.renameSync(path.join(basePath, req.file.filename), path.join(basePath, id))
    return res.status(200).json({
        message: "Image uploaded successfully",
        id: id
    })
})

// endpoint 17
app.delete("/api/images/:images_id", async (req, res) => {
    let images_id = req.params.images_id
    let api_key = req.body
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let imagePath = path.join(__dirname, "uploads", user.username, images_id)
    if (!checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
    fs.rmSync(imagePath)
    return res.status(200).json({message: "Image deleted successfully"})
})

// endpoint 18
app.post("/api/tasks/text-to-image", async (req, res) => {
    let {text, api_key} = req.body
    if (!text) return res.status(400).json({message: "Text is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let url = baseUrl + "stabilityai/stable-diffusion-2-1"
    let result
    try {
        result = (await axios.post(url, {inputs: text}, {headers: {"Authorization": "Bearer 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", "Content-Type": "multipart/form-data"}, responseType: "arraybuffer"})).data
    } catch (error) {
        return res.status(400).json({message: "Image generation failed"})
    }
    let id = uuid()
    fs.writeFileSync(path.join(__dirname, "cdn", `${id}.jpg`), result)
    return res.status(200).json({message: "Image generated successfully", url: `${serverUrl}/cdn/${id}.jpg`})
})

// endpoint 19
app.post("/api/tasks/image-classification", async (req, res) => {
    let {image_id, api_key} = req.body
    if (!image_id) return res.status(400).json({message: "Image ID is required"})
    if (!api_key) return res.status(400).json({message: "API Key is required"})
    let user = await User.findOne({where: {api_key: api_key}})
    if (user == null) return res.status(400).json({message: "Invalid API Key"})
    let url = baseUrl + "microsoft/resnet-50"
    let imagePath = path.join(__dirname, "uploads", user.username, image_id)
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

// endpoint cdn
app.get("/cdn/:filename", (req, res) => {
    return res.status(200).contentType("image/jpg").send(fs.readFileSync(path.join(__dirname, "cdn", req.params.filename)));
})

// start
app.listen(app.get("port"), () => {
    console.log(`Server started at ${serverUrl}`)
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
