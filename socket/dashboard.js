const History = require('../models/history');
const Data = require('../models/data');
const NonStress = require('../models/nonStressWords');
const Stress = require('../models/stressWords');

const filter = [
    { $match: {} },
    {
        $project: {
            'fullDocument.text': 1,
            'fullDocument.value': 1
        }
    }
];

const historyChangeStream = History.watch();
const dataChangeStream = Data.watch();
const nonStressChangeStream = NonStress.watch(filter, {
    fullDocument: 'updateLookup'
});
const stressChangeStream = Stress.watch(filter, {
    fullDocument: 'updateLookup'
});

const socket = (io) => {
    // historyChangeStream.on('change', (change) => {
    //     history = change.fullDocument;
    //     io.emit('newHistory', change.fullDocument);
    // });

    dataChangeStream.on('change', (change) => {
        if (change.operationType === 'insert') {
            data = change.fullDocument;
            io.emit('newWidget', change.fullDocument);
        } else {
            data = change.updateDescription.updatedFields;
            io.emit('newWidget', change.updateDescription.updatedFields);
        }
    });

    // stressChangeStream.on('change', (change) => {
    //     stress = change.fullDocument;
    //     io.emit('newStress', change.fullDocument);
    // });

    // nonStressChangeStream.on('change', (change) => {
    //     nonStress = change.fullDocument;
    //     io.emit('newNonStress', change.fullDocument);
    // });

    // io.on('connection', (socket) => {
    //     console.log(`Socket connect: ${socket.id}`);
    // });
};

module.exports = socket;
