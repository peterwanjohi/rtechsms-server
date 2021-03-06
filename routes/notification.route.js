const express = require('express');
const router = express.Router();

// import controller
const { requireSignin,  } = require('../controllers/auth.controller');
const {readAllController, markAllSeen,markRead } = require('../controllers/notification.controller');

router.get('/notifications', requireSignin, readAllController);
router.patch('/notifications/seen', requireSignin, markAllSeen);
router.get('/notification/read/:id', requireSignin, markRead);
// router.get('/messages/drafts', requireSignin, readDraftsController);
// router.get('/messages/all', requireSignin,superAdminMiddleware, readAllMessagesController);
// router.get('/messages/:id', requireSignin, readSingleController);
// router.post('/messages/savedraft', requireSignin, saveDraftController);
// router.post('/messages/send', requireSignin, sendController);

// router.delete('/message/single/:id/', requireSignin, deleteController);
// router.delete('/message/organization/:organization', requireSignin, deletemessagesForOrganizationController);

module.exports = router; 