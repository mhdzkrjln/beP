const router = require("express").Router();
const upload = require('../middleware/multer')
const outMails = require('../controller/outmail.controller')

router.get('/', outMails.getAll)
router.post('/', upload.single('file'), outMails.create)
router.get('/:id', outMails.getById)
router.put('/:id', upload.single('file'), outMails.update)
router.delete('/:id', outMails.delete)
router.patch('/restore/:id', outMails.restore)
router.patch('/archive/:id', outMails.archive)
router.patch('/unarchive/:id', outMails.unarchive)

module.exports = router;