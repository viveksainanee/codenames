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
  socket.on('newGame', function (data) {
    io.sockets.emit('newGame', data);
  });

  socket.on('flipCard', function (data) {
    io.sockets.emit('flipCard', data);
  });
});
