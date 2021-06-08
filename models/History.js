const mongoose = require('mongoose');

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
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    labels: {
      type: String,
      required: true,
    },
    confidence: {
      type: String,
      required: true,
    },
    time: { type: Date, default: Date.now },
  }),
  'histories'
);

module.exports = History;
