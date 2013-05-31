
// Modules /////////////////////////////////////////////////////////////////////

var WebSocket = require('ws')
  , dgram = require('dgram');


// Globals /////////////////////////////////////////////////////////////////////

var udp = dgram.createSocket('udp4')
  , myUdPort = 41234
  , oFUdPort = 11999
  , socket;


// WebSocket ///////////////////////////////////////////////////////////////////

socket = new WebSocket('ws://incubus-7783.onmodulus.net/notifications');
//socket = new WebSocket('ws://localhost:3000/notifications');

socket.on('open', function() {
  console.log("Listening for changes..");
});

socket.on('message', function(msg, flags) {
	var data = JSON.parse(msg);
	if (data.created) {
		if (udp) udpSendMessage(new Buffer("HAI:"+data.created));
		console.log('Client created at: ' + data.created);
	} else if (data.left) {
		if (udp) udpSendMessage(new Buffer("BAI:"+data.left));
		console.log('Client at #' + data.left + " has disappeared.");
	}
	else {
		console.log('Received: ' + msg);
	}
});


// UDP /////////////////////////////////////////////////////////////////////////

udp.on("message", function (msg, rinfo) {
  console.log("Receiving: " + msg + " from " +
    rinfo.address + ":" + rinfo.port);
});

udp.on("listening", function () {
  var address = udp.address();
  console.log("\n### Mediator is awaiting instructions\n");
});

function udpSendMessage(buffer) {
	udp.send(buffer, 0, buffer.length, oFUdPort, 'localhost', udpSendComplete);
}

function udpSendComplete(err) {
	if (err) console.log(err);
}

udp.bind(myUdPort);