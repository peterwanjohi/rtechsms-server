const express = require('express');
const router = express.Router();

const { updatePaymentStateController , paymentController, unitPaymentController, paymentCancelController,unitPaymentUpdateController, unitPaymentCancelController, upgradeController, senderIdPaymentController, senderIdpaymentCancelController, updateSenderIdPaymentStateController,readAllController,readAllCompleteController, readAllPendingController, readAllCompleteSenderIdPaymentsController, readAllPendingSenderIdPaymentsController, readAllCompleteUnitPaymentsController, readAllPendingUnitPaymentsController} = require('../controllers/payments.controller');

const {paymentValidator} = require('../helpers/valid');
const { requireSignin, adminMiddleware ,superAdminMiddleware} = require('../controllers/auth.controller');

router.get('/payments/allpending', requireSignin, superAdminMiddleware, readAllPendingController);
router.get('/payments/allcomplete', requireSignin, superAdminMiddleware, readAllCompleteController);
router.get('/payments/allpendingunits', requireSignin, superAdminMiddleware, readAllPendingUnitPaymentsController);
router.get('/payments/allcompleteunits', requireSignin, superAdminMiddleware, readAllCompleteUnitPaymentsController);
router.get('/payments/allpendingsenderid', requireSignin, superAdminMiddleware, readAllPendingSenderIdPaymentsController);
router.get('/payments/allcompletesenderid', requireSignin, superAdminMiddleware, readAllCompleteSenderIdPaymentsController);
router.post('/payments/subscribe', requireSignin, adminMiddleware,paymentValidator, paymentController);
router.patch('/payments/confirm',requireSignin, adminMiddleware, updatePaymentStateController);
router.patch('/payments/reject',requireSignin, superAdminMiddleware, paymentCancelController);
router.post('/payments/upgrade',requireSignin, adminMiddleware, upgradeController);

router.post('/payments/units', requireSignin, adminMiddleware, unitPaymentController);
router.patch('/payments/confirm-units',requireSignin, superAdminMiddleware, unitPaymentUpdateController);
router.patch('/payments/reject-units',requireSignin, superAdminMiddleware, unitPaymentCancelController);

router.post('/payments/senderid', requireSignin, adminMiddleware, senderIdPaymentController); 
router.patch('/payments/confirm-senderid',requireSignin, superAdminMiddleware, updateSenderIdPaymentStateController);
router.patch('/payments/reject-senderid',requireSignin, superAdminMiddleware, senderIdpaymentCancelController);

module.exports = router;  