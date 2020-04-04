const express = require('express');
const socket = require('socket.io');

// App setup
const app = express();

const server = app.listen(4000, function () {
  console.log('listening on port 4000');
});

// Static files
app.use(express.static('public'));

// Stock setup
const io = socket(server);

io.on('connection', function (socket) {
  socket.on('newGame', function (data) {
    io.sockets.emit('newGame', data);
  });

  socket.on('typing', function (data) {
    socket.broadcast.emit('typing', data);
  });
});
