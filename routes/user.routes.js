const router = require("express").Router();
const multer = require("multer");
const upload = multer()
const userControl = require('../controller/user.controller')

router.get('/', userControl.getAll)
router.delete('/:id', userControl.softDelete)
router.put('/:id', upload.none(), userControl.update)
router.get('/:id', userControl.getById)

module.exports = router