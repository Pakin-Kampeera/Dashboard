require('dotenv').config({ path: './config.env' });

// Integrate express and socket.io
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/error');

const History = require('./models/History');
const Data = require('./models/Data');

// Connect socket
io.on('connection', () => {
  console.log('Socket connected');
});

const historyChangeStream = History.watch();

historyChangeStream.on('change', (change) => {
  console.log(change)
  io.emit('new-History', change.fullDocument);
});

const dataChangeStream = Data.watch();

dataChangeStream.on('change', (change) => {
  console.log(change);
  if (change.operationType === 'insert') {
    console.log('emit insert');
    io.emit('new-Data', change.fullDocument);
  } else {
    console.log('emit update');
    io.emit('new-Data', change.updateDescription.updatedFields);
  }
});

app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Route setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/dashboard'));

// Error handler middleware
app.use(errorHandler);

// Serve Restful API
const PORT = process.env.PORT || 2000;
const server = http.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Server crash handler
process.on('unhandledRejection', (error, promise) => {
  console.log(`Logged Error: ${error}`);
  server.close(() => process.exit(1));
});

// Heroku setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
  });
}
