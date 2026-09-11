const router = require("express").Router();
const upload = require('../middleware/multer')
const matsusControl = require('../controller/matsus.controller')
const authentication = require('../middleware/authMiddleware')
const authorization = require('../middleware/authorization')

router.get('/', matsusControl.getAll)
router.post('/', upload.single('foto'), matsusControl.create)
router.get('/:id', matsusControl.getById)
router.put('/:id', upload.single('foto'), matsusControl.update)
router.delete('/:id', matsusControl.delete)
router.patch('/restore/:id', matsusControl.restore)

module.exports = router;