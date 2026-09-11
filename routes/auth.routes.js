const router = require("express").Router();
const multer = require("multer");
const upload = multer()
const authControl = require('../controller/user.controller')

router.post('/register', upload.none(), authControl.register)
router.post('/login', upload.none(), authControl.login)

module.exports = router