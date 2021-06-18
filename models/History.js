const mongoose = require('mongoose');
const moment = require('moment');

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const History = mongoose.model(
  'histories',
  new mongoose.Schema({
    userId: {
      type: String,
    },
    text: {
      type: String,
    },
    labels: {
      type: String,
    },
    confidence: {
      type: String,
    },
    time: {
      type: String,
      default: moment().format('L'),
    },
  }),
  'histories'
);

module.exports = History;
