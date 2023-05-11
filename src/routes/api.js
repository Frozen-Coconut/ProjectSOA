// srcpath
const __srcpath = __dirname.replace("\\routes", "")

// controllers
const { endpoint16, endpoint17, endpoint18, endpoint19, endpoint20 } = require(__srcpath +  "/controllers/image")
const { endpoint1, endpoint2, endpoint3} = require(__srcpath +  "/controllers/user")


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

// endpoint 1
router.post('/users/register', endpoint1)

// endpoint 2
router.post("/users/upgrade", endpoint2)

// endpoint 3
router.get("/users", endpoint3)

// // endpoint 4
// router.post("/tasks/image-classification", endpoint4)

// // endpoint 5
// router.post("/tasks/image-segmentation", endpoint5)

// endpoint 16
router.post('/images', upload.single("image"), endpoint16)

// endpoint 17
router.delete("/images/:images_id", endpoint17)

// endpoint 18
router.post("/tasks/text-to-image", endpoint18)

// endpoint 19
router.post("/tasks/image-classification", endpoint19)

// endpoint 20
router.post("/tasks/image-segmentation", endpoint20)

// exports
module.exports = router
