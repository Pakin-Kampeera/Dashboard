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
    res.status(201).json({
      success: true,
      user,
    });
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

    res.status('200').json({ success: true, token: 'kjfso8wjks234' });
  } catch (error) {
    res.status('500').json({ success: false, error: error.messages });
  }
};

// MongoDB user forgot password handler
const forgotPassword = (req, res, next) => {
  res.send('Forgot Password Route');
};

// MongoDB user reset password handler
const resetPassword = (req, res, next) => {
  res.send('Reset Password Route');
};

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken()
}

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};
