const express = require('express');
const router = express.Router();

// import controller
const { requireSignin, superAdminMiddleware } = require('../controllers/auth.controller');
const {saveDraftController, sendController,deleteController, deletemessagesForOrganizationController, readAllController, readAllMessagesController, readSingleController, readDraftsController ,getResultsForBarGraph,getMessageCount, getResultsForPieCount } = require('../controllers/message.controller');

router.get('/messages', requireSignin, readAllController);
router.get('/messages/graph', requireSignin, getResultsForBarGraph);
router.get('/messages/pie', requireSignin, getResultsForPieCount);
router.get('/messagecount/total', requireSignin, getMessageCount);

router.get('/messages/drafts', requireSignin, readDraftsController);
router.get('/messages/all', requireSignin,superAdminMiddleware, readAllMessagesController);
router.get('/messages/:id', requireSignin, readSingleController);
router.post('/messages/savedraft', requireSignin, saveDraftController);
router.post('/messages/send', requireSignin, sendController);

router.delete('/message/single/:id/', requireSignin, deleteController);
router.delete('/message/organization/:organization', requireSignin, deletemessagesForOrganizationController);

module.exports = router; 