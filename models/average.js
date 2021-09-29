const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const average = mongoose.model(
    'averages',
    new mongoose.Schema(
        {
            stress: {
                number: Number,
                default: 0
            },
            nonStress: {
                number: Number,
                default: 0
            },
            cantTell: {
                number: Number,
                default: 0
            }
        },
        { timestamps: true }
    ),
    'averages'
);

module.exports = average;
