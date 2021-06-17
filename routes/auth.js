const express = require('express');
const { register, verifiedEmail, login, forgotPassword, resetPassword } = require('../controllers/auth');
const router = express.Router();

router.route('/register').post(register);
router.route('/verifiedEmail/:verifiedToken').put(verifiedEmail);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').put(resetPassword);

module.exports = router;
