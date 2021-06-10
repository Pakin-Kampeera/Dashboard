const express = require('express');

const router = express.Router();

const { register, verifiedEmail, login, forgotPassword, resetPassword } = require('../controllers/auth');

router.route('/register').post(register);

router.route('/verifiedEmail/:verifiedToken').put(verifiedEmail);

router.route('/login').post(login);

router.route('/forgotPassword').post(forgotPassword);

router.route('/resetPassword/:resetToken').put(resetPassword);

module.exports = router;
