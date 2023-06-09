// srcpath
const __srcpath = __dirname.replace("\\routes", "")

// controllers
const { endpoint1, endpoint2, endpoint3 } = require(__srcpath +  "/controllers/user")
const { endpoint4, endpoint5, endpoint6, endpoint7, endpoint8, endpoint9, endpoint10, endpoint11 } = require(__srcpath +  "/controllers/text")
const { endpoint12, endpoint13, endpoint14, endpoint15 } = require(__srcpath +  "/controllers/chatbot");
const { endpoint16, endpoint17, endpoint18, endpoint19, endpoint20 } = require(__srcpath +  "/controllers/image")



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
router.post("/users", endpoint3)

// endpoint 4
router.post("/texts", endpoint4)

// endpoint 5
router.put("/texts/:id", endpoint5)

// endpoint 6
router.delete("/texts/:id", endpoint6)

//endpoint 7
router.get('/texts/search-text', endpoint7)

//endpoint 8
router.get('/texts/all-text', endpoint8)

//endpoint 9
router.get('/tasks/sentiment-analysis/:id_text', endpoint9)

//endpoint 10
router.get('/tasks/text-generation/:id_text', endpoint10)

//endpoint 11
router.get('/tasks/named-entity-recognition/:id_text', endpoint11)

//endpoint 12
//router.get('/tasks/named-entity-recognition/:id_text', endpoint11);

//endpoint 12
router.post('/chats/create-new-chat', endpoint12);

//endpoint 13
router.post('/chats/create-new-profile-bot/:id_chat', endpoint13)

//endpoint 14
router.post('/chats/chatting/:id_chat', endpoint14);

//endpoint 15
router.get('/chats/historys/:id_chat', endpoint15);

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
