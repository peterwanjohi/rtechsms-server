const express = require('express');
const router = express.Router();

// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth.controller');
const { readController,readAllController, updateController,updateavatarController,deleteController } = require('../controllers/user.controller');

router.get('/user/:id', requireSignin, readController);
router.get('/users/all', requireSignin,adminMiddleware, readAllController);
router.put('/user/update', requireSignin, updateController);
router.post('/user/update-avatar', requireSignin, updateavatarController);
router.delete('/user/:id', requireSignin, deleteController);
module.exports = router;