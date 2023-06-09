// srcpath
const __srcpath = __dirname.replace("\\controllers", "")

// db
const db = require(__srcpath + "/models/index.js")

// utilities
const fileUtil = require(__srcpath + "/utilities/file.js")

// imports
const axios = require("axios")
const baseUrl = "https://api-inference.huggingface.co/models/"
const path = require("path")
const fs = require("fs")
const uuid = require("uuid").v4

// exports
module.exports = {
    endpoint16: async (req, res) => {
        let basePath = path.join(__srcpath, "uploads")
        let api_key = req.header("Authorization")
        if (!api_key) {
            fs.rmSync(path.join(basePath, req.file.filename))
            return res.status(401).json({message: "API Key is required"})
        }
        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) {
            fs.rmSync(path.join(basePath, req.file.filename))
            return res.status(401).json({message: "Invalid API Key"})
        }
        if (fileUtil.checkIfExists(path.join(basePath, user.username))) {
            let dir = fs.readdirSync(path.join(basePath, user.username))
            if (dir.length >= 10) {
                fs.rmSync(path.join(basePath, req.file.filename))
                return res.status(400).json({message: "Maximum number of images reached"})
            }
        }
        if (!req.file) {
            return res.status(400).json({message: "Image is required"})
        }
        fileUtil.mkdirIfNotExists(path.join(basePath, user.username))
        let id = uuid()
        fs.renameSync(path.join(basePath, req.file.filename), path.join(basePath, user.username, id))
        return res.status(200).json({
            message: "Image uploaded successfully",
            id: id
        })  
    },
    endpoint17: async (req, res) => {
        let images_id = req.params.images_id
        let api_key = req.header("Authorization")
        if (!api_key) return res.status(401).json({message: "API Key is required"})
        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) return res.status(401).json({message: "Invalid API Key"})
        let imagePath = path.join(__srcpath, "uploads", user.username, images_id)
        if (!fileUtil.checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
        fs.rmSync(imagePath)
        return res.status(200).json({
            message: "Image deleted successfully"
        })
    },
    endpoint18: async (req, res) => {
        let text = req.body.text
        if (!text) return res.status(400).json({message: "Text is required"})
        let api_key = req.header("Authorization")
        if (!api_key) return res.status(401).json({message: "API Key is required"})
        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) return res.status(401).json({message: "Invalid API Key"})
        if (user.api_token < 1) return res.status(403).json({message: "Insufficient API Tokens"})
        let url = baseUrl + "runwayml/stable-diffusion-v1-5"
        let result
        try {
            result = (await axios.post(url, {inputs: text}, {headers: {"Authorization": "Bearer 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"}, responseType: "arraybuffer"})).data
        } catch (error) {
            return res.status(400).json({message: "Image generation failed"})
        }
        let id = uuid()
        fs.writeFileSync(path.join(__srcpath, "cdn", `${id}.jpg`), result)
        user.api_token -= 1
        await user.save()
        return res.status(200).json({
            message: "Image generated successfully",
            url: `${process.env.URL}/cdn/${id}.jpg`,
            api_token_left: user.api_token
        })
    },
    endpoint19: async (req, res) => {
        let image_id = req.body.image_id
        if (!image_id) return res.status(400).json({message: "Image ID is required"})
        let api_key = req.header("Authorization")
        if (!api_key) return res.status(401).json({message: "API Key is required"})
        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) return res.status(401).json({message: "Invalid API Key"})
        if (user.api_token < 1) return res.status(403).json({message: "Insufficient API Tokens"})
        let url = baseUrl + "microsoft/resnet-50"
        let imagePath = path.join(__srcpath, "uploads", user.username, image_id)
        if (!fileUtil.checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
        let image = fs.readFileSync(imagePath)
        let result
        try {
            result = (await axios.post(url, image, {headers: {"Authorization": "Bearer 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", "Content-Type": "multipart/form-data"}})).data
        } catch (error) {
            return res.status(400).json({message: "Image classification failed"})
        }
        user.api_token -= 1
        await user.save()
        return res.status(200).json({
            message: "Image classified successfully",
            data: result,
            api_token_left: user.api_token
        })
    },
    endpoint20: async (req, res) => {
        let image_id = req.body.image_id
        if (!image_id) return res.status(400).json({message: "Image ID is required"})
        let api_key = req.header("Authorization")
        if (!api_key) return res.status(401).json({message: "API Key is required"})
        let user = await db.User.findOne({where: {api_key: api_key}})
        if (user == null) return res.status(401).json({message: "Invalid API Key"})
        if (user.api_token < 1) return res.status(403).json({message: "Insufficient API Tokens"})
        let url = baseUrl + "openmmlab/upernet-convnext-small"
        let imagePath = path.join(__srcpath, "uploads", user.username, image_id)
        if (!fileUtil.checkIfExists(imagePath)) return res.status(400).json({message: "Image not found"})
        let image = fs.readFileSync(imagePath)
        let result
        try {
            result = (await axios.post(url, image, {headers: {"Authorization": "Bearer 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", "Content-Type": "multipart/form-data"}})).data
        } catch (error) {
            return res.status(400).json({message: "Image segmentation failed"})
        }
        user.api_token -= 1
        await user.save()
        return res.status(200).json({
            message: "Image segmented successfully",
            data: result,
            api_token_left: user.api_token
        })
    }
}
