var name    = getQueryVariable('name') || 'Anonymous';
var room    = getQueryVariable('room');
var socket  = io();

jQuery('.room-title').text(room);

socket.on('connect', function() {
  socket.emit('joinRoom', {
    name: name,
    room: room
  });
});

socket.on('message', function(message) {
  var $messages         = jQuery('.messages');
  var $message          = jQuery('<li class="list-group-item"></li>');
  var momentTimestamp   = moment.utc(message.timestamp);

  $message.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a') + '</strong>: </p>');
  $message.append('<p>' + message.text + '</p>');
  $messages.append($message);
});

var $form = jQuery('#message-form');

$form.on('submit', function(event) {
  event.preventDefault();

  var $message = $form.find('input[name=message]');
  socket.emit('message', {
    name: name,
    text: $message.val()
  });

  $message.val('');
});
