const express = require('express');
const router = express.Router();

// import controller
const { requireSignin } = require('../controllers/auth.controller');
const {readAllController,readController  } = require('../controllers/plan.controller');

router.get('/plans', requireSignin, readAllController);
router.get('/plans/upgrade/:plan', requireSignin, readController);
module.exports = router;