const router = require("express").Router();
const upload = require('../middleware/multer')
const inmailControl = require('../controller/inmail.controller')

router.get('/', inmailControl.getAll)
router.post('/', upload.single('file'), inmailControl.create)
router.get('/:id', inmailControl.getById)
router.put('/:id', upload.single('file'), inmailControl.update)
router.delete('/:id', inmailControl.delete)
router.patch('/restore/:id', inmailControl.restore)
router.patch('/archive/:id', inmailControl.archive)
router.patch('/unarchive/:id', inmailControl.unarchive)

module.exports = router;