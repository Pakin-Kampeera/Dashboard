const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const nonstress = mongoose.model(
    'nonstresswords',
    new mongoose.Schema({
        text: String,
        value: Number
    }),
    'nonstresswords'
);

module.exports = nonstress;
