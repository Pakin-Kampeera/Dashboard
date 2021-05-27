const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  sentences: [
    {
      text: { type: String, required: true },
      label: { type: String, required: true },
      confidence: { type: String, required: true },
    },
  ],
  Date: {
    type: Date,
    required: true,
  },
});

const Data = mongoose.model('Data', DataSchema);

module.exports = Data;
