const router = require("express").Router();
const reportControl = require('../controller/report.controller')

router.get('/', reportControl.getReport)

module.exports = router