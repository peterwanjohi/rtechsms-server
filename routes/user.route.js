const express = require('express');
const router = express.Router();

// import controller
const { requireSignin, adminMiddleware, superAdminMiddleware } = require('../controllers/auth.controller');
const { readController,readAllController, readAllUsersController,updateController,updateUserController,updateavatarController,deleteController,getResultsForBarGraph } = require('../controllers/user.controller');

router.get('/user/:id', requireSignin, readController);
router.get('/users/all', requireSignin,adminMiddleware, readAllController);
router.get('/users/allusers', requireSignin,superAdminMiddleware, readAllUsersController);
router.get('/users/getBarResults', requireSignin,superAdminMiddleware, getResultsForBarGraph);

router.put('/user/update', requireSignin, updateController);
router.put('/user/updateuser', requireSignin, adminMiddleware, updateUserController);
router.post('/user/update-avatar', requireSignin, updateavatarController);
router.delete('/user/:id', requireSignin, deleteController);
module.exports = router;