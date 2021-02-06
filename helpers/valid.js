const {
    check
} = require('express-validator');
exports.validSign = [
    check('organizationname', 'Organizatio name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('Organization name must be between 4 to 32 characters'),
    check('firstname', 'First Name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('First name must be between 4 to 32 characters'),
    check('lastname', 'Last Name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('Last name must be between 4 to 32 characters'),
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('phone', 'Phone number is required').notEmpty()
    .isLength({
        min: 10,
        max: 15
    }).withMessage('Phone number must be between 10 to 15 characters'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters').matches(/\d/).withMessage('password must contain a number')
]

exports.validUser = [
    check('firstname', 'First Name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('First name must be between 4 to 32 characters'),
    check('lastname', 'Last Name is required').notEmpty()
    .isLength({
        min: 4,
        max: 32
    }).withMessage('Last name must be between 4 to 32 characters'),
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('phone', 'Phone number is required').notEmpty()
    .isLength({
        min: 10,
        max: 15
    }).withMessage('Phone number must be between 10 to 15 characters'),
    
]
exports.validLogin = [
    check('email')
    .isEmail()
    .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password').isLength({
        min: 6
    }).withMessage('Password must contain at least 6 characters')
]


exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address')
];

exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be at least  6 characters long')
];
exports.paymentValidator = [
    check('amount',"Amount is required.")
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('Amount must be numeric')
];

exports.planValidator = [
    check('name',"Name is required.")
        .not()
        .isEmpty()
        .withMessage('Name must be not be empty'),
    check('price',"Price is required.")
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('price must be numeric'),
    check('maxUsers',"Maximum users is required.")
        .not()
        .isEmpty()
        .isNumeric()
        .withMessage('maximum users must be numeric')
];
exports.validDetails = [
    check('name',"Name is required.")
        .not()
        .isEmpty()
        .withMessage('Name must be numeric'),
    check('address',"Address is required.")
        .not()
        .isEmpty(),
    check('city',"City is required.")
        .not()
        .isEmpty(),
        check('country',"Country is required.")
        .not()
        .isEmpty(),
        check('motto',"Motto is required.")
        .not()
        .isEmpty(),

];