const History = require('../models/history');
const Data = require('../models/data');
const User = require('../models/user');
const Stress = require('../models/stressWords');
const NonStress = require('../models/nonStressWords');
const Average = require('../models/average');
const ErrorResponse = require('../utils/errorResponse');

const getData = async (req, res) => {
    const user = req.user;
    const history = await History.find();
    const data = await Data.find();
    const stress = await Stress.find();
    const nonStress = await NonStress.find();
    const average = await Average.find();

    let mapStress = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mapNonStress = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let mapCantTell = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    average.map((elem) => {
        mapStress[new Date(elem.createdAt).getMonth()] = elem.stress;
        mapNonStress[new Date(elem.createdAt).getMonth()] = elem.nonStress;
        mapCantTell[new Date(elem.createdAt).getMonth()] = elem.cantTell;
    });

    if (user.role === 'admin') {
        if (data.length === 0) {
            res.status(200).json({
                success: true,
                history,
                total: {
                    users: '0',
                    messages: '0',
                    stress: '0',
                    nonStress: '0',
                    cantTell: '0'
                },
                user,
                wordClouds: {
                    stress,
                    nonStress
                },
                average: {
                    mapStress,
                    mapNonStress,
                    mapCantTell
                }
            });
        } else {
            res.status(200).json({
                success: true,
                history,
                total: data[0],
                user,
                wordClouds: {
                    stress,
                    nonStress
                },
                average: {
                    mapStress,
                    mapNonStress,
                    mapCantTell
                }
            });
        }
    } else {
        if (data.length === 0) {
            res.status(200).json({
                success: true,
                total: {
                    users: '0',
                    messages: '0',
                    stress: '0',
                    nonStress: '0',
                    cantTell: '0'
                },
                user,
                average: {
                    mapStress,
                    mapNonStress,
                    mapCantTell
                }
            });
        } else {
            res.status(200).json({
                success: true,
                total: data[0],
                user,
                average: {
                    mapStress,
                    mapNonStress,
                    mapCantTell
                }
            });
        }
    }
};

const getUsers = async (req, res, next) => {
    const userInfo = req.user;
    const user = await User.find();

    if (userInfo.role === 'admin') {
        return res.status(200).json({ success: true, user });
    }
    next(new ErrorResponse('Not authorized to access this route', 401));
};

const changeUserRole = async (req, res, next) => {
    const userInfo = req.user;
    const { adminID, userID } = req.body;

    if (userInfo.role === 'admin') {
        try {
            if (adminID.length !== 0) {
                await User.updateMany(
                    { _id: { $in: adminID } },
                    { role: 'admin' }
                );
            }
            if (userID.length !== 0) {
                await User.updateMany(
                    { _id: { $in: userID } },
                    { role: 'user' }
                );
            }
            res.status(200).json({
                success: true,
                message: 'Role update success!'
            });
        } catch (error) {
            next(new ErrorResponse('Update user role fail', 400));
        }
    }
    next(new ErrorResponse('Not authorized to access this route', 401));
};

module.exports = { getData, getUsers, changeUserRole };
