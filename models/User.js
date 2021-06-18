const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Create User Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    require: true,
    select: false,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    select: false,
  },
  verifiedEmailToken: String,
  verifiedEmailExpire: Date,
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

  return this.resetPasswordToken;
};

// Assign verify token
UserSchema.methods.getVerifiedToken = function () {
  const verifyToken = crypto.randomBytes(20).toString('hex');

  this.isVerified = false;
  this.verifiedEmailToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  console.log(this.verifiedEmailToken);
  this.verifiedEmailExpire = Date.now() + 10 * (60 * 1000);

  return this.verifiedEmailToken;
};

// Create user model
const User = mongoose.model('User', UserSchema);

module.exports = User;
