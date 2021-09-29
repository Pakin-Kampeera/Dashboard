const User = require('../models/user');
const ErrorResponse = require('../utils/errorResponse');
const { sendResetPassword, sendVerifiedEmail } = require('../utils/sendEmail');

const register = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return next(new ErrorResponse('This email is already used', 400));
        }

        const user = await User.create({
            username,
            email,
            password
        });

        const verifyToken = user.getVerifiedToken();

        await user.save();

        try {
            await sendVerifiedEmail({
                from: 'Stress Analysis',
                to: user.email,
                link: `${process.env.FRONTEND_URL}/verified-email/${verifyToken}`
            });
            res.status(200).json({
                success: true,
                message: 'The email is sent, please verify your email'
            });
        } catch (error) {
            next(new ErrorResponse('Email could not be sent', 500));
        }
    } catch (error) {
        next(error);
    }
};

const verifiedEmail = async (req, res, next) => {
    const verifiedEmailToken = req.params.token;
    try {
        try {
            const user = await User.findOne({
                verifiedEmailToken,
                verifiedEmailExpire: { $gt: Date.now() }
            });

            if (!user) {
                return next(
                    new ErrorResponse(
                        'Verify token has been expired, please register again',
                        400
                    )
                );
            }

            user.isVerified = true;
            user.verifiedEmailToken = undefined;
            user.verifiedEmailExpire = undefined;

            await user.save();

            return res.status(201).json({
                success: true,
                message: 'Your email address has been verified'
            });
        } catch (error) {
            return next(
                new ErrorResponse(
                    'Verify token has been expired, please register again',
                    400
                )
            );
        }
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select(
            'email password isVerified created'
        );

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

        const token = await user.getSignedToken();

        res.status(200).json({
            success: true,
            email: user.email,
            token,
            created: user.created,
            role: user.role
        });
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorResponse('Email could not be sent', 400));
        }

        const resetToken = user.getResetPasswordToken();

        await user.save();

        try {
            await sendResetPassword({
                from: 'Stress Analysis',
                to: user.email,
                link: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
            });

            res.status(200).json({
                success: true,
                message: 'Email is sent, please check in mailbox'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return next(new ErrorResponse('Email could not be send', 400));
        }
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    const resetPasswordToken = req.params.token;

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return next(
                new ErrorResponse('Expired link, please try again', 400)
            );
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(201).json({
            success: true,
            message: 'Congrats! Now you can login with the new password'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    verifiedEmail,
    login,
    forgotPassword,
    resetPassword
};
