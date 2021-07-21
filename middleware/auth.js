const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/user');

const auth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new ErrorResponse('Not authorized to access this route', 401)
        );
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.id);

        if (!user) {
            next(new ErrorResponse('No user found with this id', 404));
        }

        req.user = user;

        next();
    } catch (error) {
        return next(
            new ErrorResponse('Not authorized to access this route', 401)
        );
    }
};

module.exports = auth;
