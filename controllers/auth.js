const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// MongoDB user register handler
const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.create({
      username,
      email,
      password,
    });

    await user.save((err) => {
      if (err) return console.error(err);
      console.log('Document is inserted');
    });

    sendToken(user, '201', res);
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
    const user = await User.findOne({ email }).select('password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
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
    const user = User.findOne({ email });

    if (!email) {
      return next(new ErrorResponse('Email could not be sent', 404));
    }

    const resetToken = user.getResetPasswordToken();

    await user.save();

    const resetUrl = `http://localhost:${process.env.PORT}/passwordReset/${resetToken}`;

    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please go to this link to reset your password</p>
      <a href='${resetUrl}' clicktracking='off'>Reset</a>
    `;
  } catch (error) {
    res.status('500').json({ success: false, error: error.messages });
  }
};

// MongoDB user reset password handler
const resetPassword = (req, res, next) => {
  res.send('Reset Password Route');
};

const sendToken = async (user, statusCode, res) => {
  const token = await user.getSignedToken();
  res.status(statusCode).json({ success: true, token });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
