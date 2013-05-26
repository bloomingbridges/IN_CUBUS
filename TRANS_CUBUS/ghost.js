
var address = 'incubus.bloomingbridges.co.uk/'
  , timeOut;

function establishSocketConnection() {
	var socket = new WebSocket('ws://'+address);
	socket.onopen = function(event) {
		console.log("Hoo!");
	}
	socket.onmessage = function(event) {
		console.log("Lingering..");
		timeOut = setTimeout(function() {
			console.log("Dissolving..");
			phantom.exit();
		}, 3000 + (Math.random() * 11700));
	}
}

var page = require('webpage').create();
page.open('http://'+address, function(status) {
	if (status === 'success') {
		console.log("Boo!");
		establishSocketConnection();
	}
});
