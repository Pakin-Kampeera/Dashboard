const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            require: true,
            select: false,
            trim: true
        },
        isVerified: {
            type: Boolean,
            select: false
        },
        role: {
            type: String,
            require: true
        },
        verifiedEmailToken: String,
        verifiedEmailExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date
    },
    { timestamps: true }
);

// Salt and Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password string with hash password
userSchema.methods.matchPassword = async function (password) {
    const hash = await bcrypt.compare(password, this.password);
    return hash;
};

// Sign user token
userSchema.methods.getSignedToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

// Assign new token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

    return this.resetPasswordToken;
};

// Assign verify token
userSchema.methods.getVerifiedToken = function () {
    const verifyToken = crypto.randomBytes(20).toString('hex');

    this.role = 'user';
    this.isVerified = false;
    this.verifiedEmailToken = crypto
        .createHash('sha256')
        .update(verifyToken)
        .digest('hex');
    this.verifiedEmailExpire = Date.now() + 10 * (60 * 1000);

    return this.verifiedEmailToken;
};

// Create user model
const user = mongoose.model('User', userSchema);

module.exports = user;
