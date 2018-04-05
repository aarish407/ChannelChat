var PORT      = process.env.PORT || 3000;
var express   = require('express');
var app       = express();
var http      = require('http').Server(app);
var io        = require('socket.io')(http);
var moment    = require('moment');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

function sendCurrentUsers(socket) {
  var info  = clientInfo[socket.id];
  var users = [];

  if (typeof info === 'undefined') {
    return;
  }

  Object.keys(clientInfo).forEach(function(socketId) {
    var userInfo = clientInfo[socketId];

    // if (info.room === userInfo.room || info.room != null) {
    //   users.push(userInfo.name);
    // }

    if (info.room === userInfo.room) {
      users.push(userInfo.name);
    }

    socket.emit('message', {
      name: 'Multi Channel bot',
      text: 'Current Users: ' + users.join(', '),
      timestamp: moment().valueOf()
    });
  });
}

function sendCurrentChannels(socket) {
  var channels = [];

  Object.keys(clientInfo).forEach(function(socketId) {
    var channelInfo = clientInfo[socketId];

    channels.push(channelInfo.room);

    socket.emit('message', {
      name: 'Multi Channel bot',
      text: 'Current Channels: ' + channels.join(', '),
      timestamp: moment().valueOf()
    });
  });
}

io.on('connection', function(socket) {

  //////////////////////WELISA ADD YOUR CODE HERE////////////////////////////


  //When a client leaves the chat room 

  socket.on('disconnect', function() {
    var userData = clientInfo[socket.id];
    if (typeof userData !== 'undefined') {
      socket.leave(userData.room);
      io.to(userData.room).emit('message', {
        name: 'Multi Channel bot',
        text: userData.name + ' has left the chat room.',
        timestamp: moment().valueOf()
      });
      delete clientInfo[socket.id];
    }
  });

  //When a client wants to join a room or create a new room 

  socket.on('joinRoom', function(req){
    clientInfo[socket.id] = req;
    socket.join(req.room);
    socket.broadcast.to(req.room).emit('message', {
      name: 'Multi Channel bot',
      text: req.name + ' has joined #' + req.room,
      timestamp: moment().valueOf()
    });
  });

  //When a client wants to send a message in the chat room

  socket.on('message', function(message) {
    if (message.text === '@currentUsers') {
      sendCurrentUsers(socket);
    } 

    else if (message.text === '@currentChannels') {
      sendCurrentChannels(socket);
    } 

    else {
      message.timestamp = moment().valueOf();
      io.to(clientInfo[socket.id].room).emit('message', message);
    }
  });

  socket.emit('message', {
    name: 'Multi Channel bot',
    // text: 'Welcome to the chat application! If you want to join an existent chat room then enter the name of that chat room, else enter the name of the new chat room that you want to create.',
    text: 'Enter message',
    timestamp: moment().valueOf()
  });
});

http.listen(PORT, function() {
  console.log('Listening on port 3000');
});

module.exports = app
