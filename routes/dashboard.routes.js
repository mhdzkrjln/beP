const router = require("express").Router();
const dashboardControl = require('../controller/dashboard.controller')

router.get('/', dashboardControl.getDashboard)

module.exports = router