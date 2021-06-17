const mongoose = require('mongoose');
const moment = require('moment');

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Data = mongoose.model(
  'datas',
  new mongoose.Schema({
    users: {
      type: Number,
    },
    comments: {
      type: Number,
    },
    stress: {
      type: Number,
    },
    nonStress: {
      type: Number,
    },
    time: {
      type: String,
      default: moment().subtract(10, 'days').calendar(),
    },
  }),
  'datas'
);

module.exports = Data;
