const express = require('express');
const {
    register,
    verifiedEmail,
    login,
    forgotPassword,
    resetPassword
} = require('../controllers/auth');

const router = express.Router();

router.route('/register').post(register);
router.route('/verified-email/:token').put(verifiedEmail);
router.route('/login').post(login);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').put(resetPassword);

module.exports = router;
