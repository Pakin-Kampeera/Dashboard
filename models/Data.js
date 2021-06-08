const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useCreateIndex: true,
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Data = mongoose.model(
  'datas',
  new mongoose.Schema(
    {
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
    },
    { timestamps: { currentTime: () => Math.floor(Date.now() / 1000) } }
  ),
  'datas'
);

module.exports = Data;
