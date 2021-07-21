const mongoose = require('mongoose');
const moment = require('moment');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Data = mongoose.model(
    'datas',
    new mongoose.Schema({
        users: {
            type: Number,
            default: 0
        },
        comments: {
            type: Number,
            default: 0
        },
        stress: {
            type: Number,
            default: 0
        },
        nonStress: {
            type: Number,
            default: 0
        },
        time: {
            type: String,
            default: moment().format('L')
        }
    }),
    'datas'
);

module.exports = Data;
