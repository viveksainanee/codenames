const express = require('express');
const socket = require('socket.io');

const PORT = process.env.PORT || 4000;

// App setup
const app = express();

const server = app.listen(PORT, function () {
  console.log(`listening on ${PORT}`);
});

// Static files
app.use(express.static('public'));

// Stock setup
const io = socket(server);

io.on('connection', function (socket) {
  socket.on('requestData', function (data) {
    io.sockets.emit('requestData', data);
  });

  socket.on('syncInitialData', function (data) {
    io.sockets.emit('syncInitialData', data);
  });

  socket.on('newGame', function (data) {
    io.sockets.emit('newGame', data);
  });

  socket.on('flipCard', function (data) {
    io.sockets.emit('flipCard', data);
  });

  socket.on('addPlayer', function (data) {
    io.sockets.emit('addPlayer', data);
  });

  socket.on('addSpymaster', function (data) {
    io.sockets.emit('addSpymaster', data);
  });

  socket.on('endGame', function (data) {
    io.sockets.emit('endGame', data);
  });

  socket.on('removePlayer', function (data) {
    io.sockets.emit('removePlayer', data);
  });
});
