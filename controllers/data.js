const History = require('../models/History');
const Data = require('../models/Data');
const ErrorResponse = require('../utils/errorResponse');

const getData = async (req, res, next) => {
  const history = await History.find();
  const data = await Data.find();
  if (data.length === 0) {
    res.status(200).json({
      success: true,
      history: history,
      total: { users: '0', comments: '0', stress: '0', nonStress: '0' },
    });
  } else {
    res.status(200).json({ success: true, history: history, total: data[0] });
  }
};

const getUsers = (req, res, next) => {};

const getSettings = (req, res, next) => {};

module.exports = { getData, getUsers, getSettings };
