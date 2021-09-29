const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const data = mongoose.model(
    'datas',
    new mongoose.Schema(
        {
            users: Number,
            messages: Number,
            stress: Number,
            nonStress: Number,
            cantTell: Number
        },
        { timestamps: true }
    ),
    'datas'
);

module.exports = data;
