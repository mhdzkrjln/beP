const router = require("express").Router();
const multer = require("multer");
const upload = multer()
const categoryControl = require('../controller/category.controller')

router.get('/', categoryControl.getAll)
router.post('/', upload.none(), categoryControl.create)
router.put('/:id', upload.none(), categoryControl.update)
router.delete('/:id', categoryControl.delete)

module.exports = router