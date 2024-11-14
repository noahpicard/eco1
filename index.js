const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected');

  fs.readFile('messages.txt', 'utf8', function (err, data) {
    if (err) throw err;
    console.log(data);
    const lines = data.split('\n');
    lines.forEach(line => {
      socket.emit('chat message', line);
    });
  });

  io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
      fs.appendFile('messages.txt', `\n${msg}`, function (err) {
        if (err) throw err;
        console.log('Added to messages:', msg);
      });
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(80, () => {
  console.log('listening on *:80');
});