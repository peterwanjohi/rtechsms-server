const express = require('express');
const router = express.Router();

const { updatePaymentStateController , paymentController, unitPaymentController, unitPaymentUpdateController} = require('../controllers/payments.controller');
const {paymentValidator} = require('../helpers/valid');
const { requireSignin, adminMiddleware ,superAdminMiddleware} = require('../controllers/auth.controller');

router.post('/payments/subscribe', requireSignin, adminMiddleware,paymentValidator, paymentController);
router.post('/payments/confirm',requireSignin, superAdminMiddleware, updatePaymentStateController);
router.post('/payments/units', requireSignin, adminMiddleware, unitPaymentController);
router.post('/payments/confirm-units',requireSignin, superAdminMiddleware, unitPaymentUpdateController);

module.exports = router;