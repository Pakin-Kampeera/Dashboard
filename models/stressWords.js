const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const stress = mongoose.model(
    'stresswords',
    new mongoose.Schema({
        text: String,
        value: Number
    }),
    'stresswords'
);

module.exports = stress;
