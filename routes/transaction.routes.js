const router = require("express").Router();
const multer = require("multer");
const upload = multer();
const borrowingControl = require('../controller/transaction.controller');

router.get("/", borrowingControl.getAll);
router.get("/:id", borrowingControl.getById);
router.post("/", upload.none(), borrowingControl.create);
router.put("/:id", upload.none(), borrowingControl.update);
router.delete("/:id", borrowingControl.delete);

module.exports = router;