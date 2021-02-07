const express = require('express');
const router = express.Router();

// import controller
const { requireSignin } = require('../controllers/auth.controller');
const { readContactsController,readAllSingleContactsController, saveController,deleteController, saveSingleController, deleteSingleController } = require('../controllers/contacts.controller');

router.get('/contacts/groups', requireSignin, readContactsController);
router.get('/contacts/single', requireSignin, readAllSingleContactsController);
router.post('/contacts/save', requireSignin, saveController);
router.post('/contacts/save-single', requireSignin, saveSingleController);
router.delete('/contacts/:group', requireSignin,deleteController);
router.delete('/contacts/:id', requireSignin,deleteSingleController);

module.exports = router;