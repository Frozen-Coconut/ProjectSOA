// srcpath
const __srcpath = __dirname.replace("\\routes", "")

// controllers
const { endpointCDN } = require("../controllers/cdn")

// imports
const express = require("express")
const router = express.Router()

// endpoint cdn
router.get("/:filename", endpointCDN)

// exports
module.exports = router
