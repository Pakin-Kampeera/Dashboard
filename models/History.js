const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  confidence: {
    type: String,
    required: true,
  },
});

const History = mongoose.model('History', HistorySchema);

module.exports = History;
