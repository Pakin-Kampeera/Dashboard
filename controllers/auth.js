const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendResetPassword = require('../utils/sendResetPassword');
const sendVerifiedEmail = require('../utils/sendVerifiedEmail');
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

    try {
      await sendVerifiedEmail({
        from: 'Stress Analysis',
        to: user.email,
        link: `http://localhost:3000/verifiedEmail/${verifyToken}`,
      });

      res.status(200).json({ success: true, data: 'Email has been sent, please verify' });
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

    res.status(201).json({ success: true, data: 'Email successfully verify' });
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

    try {
      await sendResetPassword({
        from: 'Stress Analysis',
        to: user.email,
        link: `http://localhost:3000/resetPassword/${resetToken}`,
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
