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

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect MongoDB
connectDB();

// Route setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/dashboard'));

// Connect socket
io.on('connection', (socket) => {
  console.log('Socket connected');
});

// Error handler middleware
app.use(errorHandler);

// Serve Restful API
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
