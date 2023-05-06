// srcpath
const __srcpath = __dirname.replace("\\routes", "")

// controllers
const { endpoint16_1, endpoint16_2, endpoint17, endpoint18, endpoint19, endpoint20 } = require(__srcpath +  "/controllers/image")

// imports
const express = require("express")
const router = express.Router()
const path = require("path")
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

// endpoint 16
router.post('/images', endpoint16_1, upload.single("image"), endpoint16_2)

// endpoint 17
router.delete("/images/:images_id", endpoint17)

// endpoint 18
router.post("/tasks/text-to-image", endpoint18)

// endpoint 19
router.post("/tasks/image-classification", endpoint19)

// endpoint 20
router.post("/tasks/image-classification", endpoint20)

// exports
module.exports = router
