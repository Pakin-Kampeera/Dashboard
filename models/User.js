const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Create User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    minlength: 4,
    maxlength: 32,
  },
  email: {
    type: String,
    required: [true, 'Please provide a email'],
    unique: true,
    match: [/[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    require: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  isVerified: {
    type: Boolean,
    select: false,
  },
  verifiedEmailToken: String,
  verifiedEmailExpire: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Salt and Hash password before save
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password string with hash password
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Sign user token
UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// Assign new token
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

// Assign verify token
UserSchema.methods.getVerifiedToken = function () {
  const verifyToken = crypto.randomBytes(20).toString('hex');

  this.isVerified = false;
  this.verifiedEmailToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.verifiedEmailExpire = Date.now() + 10 * (60 * 1000);

  return verifyToken;
};

// Create user model
const User = mongoose.model('User', UserSchema);

module.exports = User;
