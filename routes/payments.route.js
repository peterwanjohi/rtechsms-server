const express = require('express');
const router = express.Router();

const { updatePaymentStateController , paymentController, unitPaymentController, paymentCancelController,unitPaymentUpdateController, unitPaymentCancelController, upgradeController} = require('../controllers/payments.controller');
const {paymentValidator} = require('../helpers/valid');
const { requireSignin, adminMiddleware ,superAdminMiddleware} = require('../controllers/auth.controller');

router.post('/payments/subscribe', requireSignin, adminMiddleware,paymentValidator, paymentController);
router.post('/payments/confirm',requireSignin, superAdminMiddleware, updatePaymentStateController);
router.post('/payments/reject',requireSignin, superAdminMiddleware, paymentCancelController);
router.post('/payments/upgrade',requireSignin, adminMiddleware, upgradeController);

router.post('/payments/units', requireSignin, adminMiddleware, unitPaymentController);
router.post('/payments/confirm-units',requireSignin, superAdminMiddleware, unitPaymentUpdateController);
router.post('/payments/reject-units',requireSignin, superAdminMiddleware, unitPaymentCancelController);

module.exports = router;