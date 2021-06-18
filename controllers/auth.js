const validator = require('validator');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { sendResetPassword, sendVerifiedEmail } = require('../utils/sendEmail');

const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (validator.isEmpty(username)) {
    return next(new ErrorResponse('Please provide username', 400));
  }

  if (!validator.isLength(username, { min: 4, max: 32 })) {
    return next(new ErrorResponse('Username length must between 4-32 characters', 400));
  }

  if (validator.isEmpty(email)) {
    return next(new ErrorResponse('Please provide email', 400));
  }

  if (!validator.isEmail(email)) {
    return next(new ErrorResponse(`Please provide valid email`, 400));
  }

  if (validator.isEmpty(password)) {
    return next(new ErrorResponse('Please provide password', 400));
  }

  if (!validator.isLength(password, { min: 8 })) {
    return next(new ErrorResponse('Password length must be at least 8 character', 400));
  }

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return next(new ErrorResponse('This email is already used', 400));
    }

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
  const verifiedEmailToken = req.params.verifiedToken;

  try {
    try {
      const user = await User.findOne({ verifiedEmailToken, verifiedEmailExpire: { $gt: Date.now() } });

      if (!user) {
        return res.status(200).json({ success: false, data: 'Verify token has been expired, please register again' });
      }

      user.isVerified = true;
      user.verifiedEmailToken = undefined;
      user.verifiedEmailExpire = undefined;

      await user.save();

      return res.status(201).json({ success: true, data: 'Email successfully verify' });
    } catch (error) {
      return res.status(200).json({ success: false, data: 'Verify token has been expired, please register again' });
    }
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (validator.isEmpty(email)) {
    return next(new ErrorResponse('Please provide email', 400));
  }

  if (validator.isEmpty(password)) {
    return next(new ErrorResponse('Please provide password', 400));
  }

  try {
    const user = await User.findOne({ email }).select('password isVerified');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (!user.isVerified) {
      return next(new ErrorResponse('Please verify email', 401));
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

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  if (validator.isEmpty(email)) {
    return next(new ErrorResponse('Please provide email', 400));
  }

  if (validator.isEmail(email)) {
    return next(new ErrorResponse(`Please provide valid email`, 400));
  }

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

      res.status(200).json({ success: true, data: 'Email has been sent' });
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

const resetPassword = async (req, res, next) => {
  const resetPasswordToken = req.params.resetToken;

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
