const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// MongoDB user register handler
const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    const verifyToken = user.getVerifiedToken();

    await user.save();

    const verifiedUrl = `http://localhost:3000/verifiedEmail/${verifyToken}`;

    const message = `
    <h1>You have requested a new account</h1>
    <p>Please go to this link to verify your email</p>
    <a href='${verifiedUrl}' clicktracking='off'>${verifiedUrl}</a>
    `;

    try {
      await sendEmail({
        from: 'Stress Detection',
        to: user.email,
        subject: 'Password Verify Email',
        html: message,
      });

      res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (error) {
      return next(new ErrorResponse('Email could not be send', 500));
    }
  } catch (error) {
    user.isVerified = undefined;
    user.verifiedEmailToken = undefined;
    user.verifiedEmailExpire = undefined;

    await user.save();
    next(error);
  }
};

const verifiedEmail = async (req, res, next) => {
  const verifiedEmailToken = crypto.createHash('sha256').update(req.params.verifiedToken).digest('hex');

  try {
    const user = await User.findOne({ verifiedEmailToken, verifiedEmailExpire: { $gt: Date.now() } });

    if (!user) {
      return next(new ErrorResponse('Invalid Verified Token', 400));
    }

    user.isVerified = true;
    user.verifiedEmailToken = undefined;
    user.verifiedEmailExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: 'Email Verify Success' });
  } catch (error) {
    next(error);
  }
};

// MongoDB user login handler
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Please provide email and password', 400));
  }

  try {
    const user = await User.findOne({ email }).select('password isVerified');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (!user.isVerified) {
      return next(new ErrorResponse('Please verify password', 401));
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    sendToken(user, '200', res);
  } catch (error) {
    res.status('500').json({ success: false, error: error.messages });
  }
};

// MongoDB user forgot password handler
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('Email could not be sent', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:3000/resetPassword/${resetToken}`;

    const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset your password</p>
    <a href='${resetUrl}' clicktracking='off'>${resetUrl}</a>
    `;

    try {
      await sendEmail({
        from: 'Stress Detection',
        to: user.email,
        subject: 'Password Reset Request',
        html: message,
      });

      res.status(200).json({ success: true, data: 'Email Sent' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return next(new ErrorResponse('Email could not be send', 500));
    }
  } catch (error) {
    next(error);
  }
};

// MongoDB user reset password handler
const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

  try {
    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if (!user) {
      return next(new ErrorResponse('Invalid Reset Token', 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({ success: true, data: 'Password Reset Success' });
  } catch (error) {
    next(error);
  }
};

const sendToken = async (user, statusCode, res) => {
  const token = await user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};

module.exports = {
  register,
  verifiedEmail,
  login,
  forgotPassword,
  resetPassword,
};
