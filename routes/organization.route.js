const express = require('express')
const router = express.Router()

// Load Controllers
const {
    readOrganizationController,
    updateController,
    updateLogoController,
    readOrganizationPayStatus,
    readAllOrganizationController,
    readOrganizationStatus,
    getResultsForPieCount
} = require('../controllers/organization.controller');

const {
    validDetails,
} = require('../helpers/valid');
const { requireSignin,adminMiddleware, superAdminMiddleware } = require('../controllers/auth.controller');
const { readAllController } = require('../controllers/user.controller');

router.get('/organization',  requireSignin, readOrganizationController);
router.get('/organizations/all',  requireSignin,superAdminMiddleware, readAllOrganizationController);
router.get('/organizations/getResultsForPie',  requireSignin,superAdminMiddleware, getResultsForPieCount);

router.get('/organization/users',  requireSignin, readAllController);
router.get('/organization/paymentstatus',  requireSignin, readOrganizationPayStatus);
router.get('/organization/status',  requireSignin, readOrganizationStatus);

// Update details
router.post('/organization/update-logo', validDetails,requireSignin,adminMiddleware, updateLogoController);

router.put('/organization/update', validDetails,requireSignin,adminMiddleware, updateController);

module.exports = router