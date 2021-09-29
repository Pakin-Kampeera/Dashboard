require('dotenv').config({ path: './.env.prod' });

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, { cors: { origin: '*' } });

const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

app.use(cors());
app.use(express.json());

// Database
connectDB();

// Socket
require('./socket/dashboard')(io);

// Route
app.use('/api/auth', require('./routes/auth'));
app.use('/api/data', require('./routes/data'));

// Error handler
app.use(errorHandler);

// RESTful API
const PORT = process.env.PORT || 2000;
const server = http.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

// Server Crash handler
process.on('unhandledRejection', (error) => {
    console.log(`Logged Error: ${error}`);
    server.close(() => process.exit(1));
});

module.exports = server;
