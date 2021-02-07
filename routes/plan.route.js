const express = require('express');
const router = express.Router();

// import controller
const { requireSignin } = require('../controllers/auth.controller');
const {readAllController,readController, readSingleController } = require('../controllers/plan.controller');

router.get('/plans', requireSignin, readAllController);
router.get('/plans/upgrade/:plan', requireSignin, readController);
router.get('/plans/details/:plan', requireSignin, readSingleController);
module.exports = router;