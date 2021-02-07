const express = require('express');
const router = express.Router();

const { updatePaymentStateController , paymentController, unitPaymentController, paymentCancelController,unitPaymentUpdateController, unitPaymentCancelController, upgradeController, senderIdPaymentController, senderIdpaymentCancelController, updateSenderIdPaymentStateController} = require('../controllers/payments.controller');

const {paymentValidator} = require('../helpers/valid');
const { requireSignin, adminMiddleware ,superAdminMiddleware} = require('../controllers/auth.controller');

router.post('/payments/subscribe', requireSignin, adminMiddleware,paymentValidator, paymentController);
router.post('/payments/confirm',requireSignin, superAdminMiddleware, updatePaymentStateController);
router.post('/payments/reject',requireSignin, superAdminMiddleware, paymentCancelController);
router.post('/payments/upgrade',requireSignin, adminMiddleware, upgradeController);

router.post('/payments/units', requireSignin, adminMiddleware, unitPaymentController);
router.post('/payments/confirm-units',requireSignin, superAdminMiddleware, unitPaymentUpdateController);
router.post('/payments/reject-units',requireSignin, superAdminMiddleware, unitPaymentCancelController);

router.post('/payments/senderid', requireSignin, adminMiddleware, senderIdPaymentController);
router.post('/payments/confirm-senderid',requireSignin, superAdminMiddleware, updateSenderIdPaymentStateController);
router.post('/payments/reject-senderid',requireSignin, superAdminMiddleware, senderIdpaymentCancelController);

module.exports = router;