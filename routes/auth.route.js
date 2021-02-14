const express = require('express')
const router = express.Router()

// Load Controllers
const {
    registerController,
    registerUserController,
    activationController,
    signinController,
    forgotPasswordController,
    resetPasswordController,
    changePasswordController,
    googleController,
    facebookController,
    testMail,
    
} = require('../controllers/auth.controller')



const {
    validSign,
    validUser,
    validLogin,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../helpers/valid');
const { requireSignin,adminMiddleware } = require('../controllers/auth.controller');
router.get('/testmail', testMail);
router.get('/sendmail', testMail);
router.post('/register',  validSign, registerController)
router.post('/add-user',requireSignin,adminMiddleware, validUser, registerUserController);

router.post('/login',validLogin, signinController);

router.post('/activation', activationController);

router.put('/changepassword',requireSignin,changePasswordController);

// forgot reset password
router.put('/forgotpassword', forgotPasswordValidator, forgotPasswordController);
router.put('/resetpassword', resetPasswordValidator, resetPasswordController);

// // Google and Facebook Login
// router.post('/googlelogin', googleController)
// router.post('/facebooklogin', facebookController)
module.exports = router