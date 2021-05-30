const { isValidObjectId } = require('mongoose');
const Data = require('../models/Data');
const History = require('../models/History');
const ErrorResponse = require('../utils/errorResponse');

// const dataChangeStream = Data.watch();

// dataChangeStream.on('change', (change) => {
//   console.log(change);
//   io.emit('changeData', change);
// });

// const historyChangeStream = History.watch()

// historyChangeStream.on('change', (change) => {
//   console.log(change)
//   isValidObjectId.emit('changeHistory', change)
// })

const getData = (req, res, next) => {
  res.status(200).json({ success: true, data: 'You got access to the private data in this route' });
};

const getUsers = (req, res, next) => {};

const getSettings = (req, res, next) => {};

module.exports = { getData, getUsers, getSettings };
