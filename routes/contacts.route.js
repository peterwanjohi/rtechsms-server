const express = require('express');
const router = express.Router();

// import controller
const { requireSignin } = require('../controllers/auth.controller');
const { readContactsController, saveController,deleteController } = require('../controllers/contacts.controller');

router.get('/contacts/groups', requireSignin, readContactsController);
router.post('/contacts/save', requireSignin, saveController);
router.delete('/contacts/:group', requireSignin,deleteController);

module.exports = router;