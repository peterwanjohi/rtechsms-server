const express = require('express');
const router = express.Router();

// import controller
const { requireSignin, superAdminMiddleware } = require('../controllers/auth.controller');
const { readAllController, readSingleController, saveController, approveController, deleteController } = require('../controllers/senderIdRequest.controller');

router.get('/senderid/:name', requireSignin,superAdminMiddleware, readSingleController);
router.get('/senderids', requireSignin,superAdminMiddleware, readAllController);
router.post('/senderid/save', requireSignin,superAdminMiddleware, saveController);
router.put('/senderid/approve', requireSignin,superAdminMiddleware, approveController);
router.delete('/sender/:name/:organization', requireSignin,superAdminMiddleware, deleteController);
module.exports = router;