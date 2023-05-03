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
app.set("port", 3000)
app.use(express.json())
app.use(express.urlencoded({extended: true}))
const joi = require("joi").extend(require("@joi/date"))
const axios = require("axios")
const jwt = require("jsonwebtoken")
const SECRET_KEY = "project_soa_6868_6874_6876_6883"
const path = require("path")
const fs = require("fs")
mkdirIfNotExists(path.join(__dirname, "uploads"))
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
    if (!image) return res.status(400).json({message: "An image is required"})
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
    fs.renameSync(path.join(basePath, req.file.filename), path.join(basePath, `${id}${path.extname(req.file.filename)}`))
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
    try {
        fs.statSync(imagePath)
    } catch (error) {
        return res.status(400).json({message: "Image not found"})
    }
    fs.rmSync(imagePath)
    return res.status(200).json({message: "Image deleted successfully"})
})

// start
app.listen(app.get("port"), () => {
    console.log(`Server started at http://localhost:${app.get("port")}`);
});

// utilities
function mkdirIfNotExists(path) {
    try {
        fs.statSync(path)
    } catch (error) {
        fs.mkdirSync(path)
    }
}
