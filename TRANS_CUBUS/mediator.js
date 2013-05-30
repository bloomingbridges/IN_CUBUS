
var WebSocket = require('ws')
  , dgram = require('dgram');

var socket;

// socket = new WebSocket('ws://incubus-7783.onmodulus.net/notifications');
socket = new WebSocket('ws://localhost:3000/notifications');
socket.on('open', function() {
  console.log("Listening for changes..");
});

socket.on('message', function(msg, flags) {
	var data = JSON.parse(msg);
	if (data.created)
		console.log('Client created at: ' + data.created);
	else if (data.left) {
		console.log('Client at #' + data.left + " has disappeared.");
	}
	else {
		console.log('Received: ' + msg);
	}
});
