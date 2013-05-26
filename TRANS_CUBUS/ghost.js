
var address = 'incubus.bloomingbridges.co.uk/';
var page = require('webpage').create();
var timeOut;

page.open('http://'+address, function(status) {
	if (status === 'success') {
		console.log("Boo!");
		page.evaluate(function() {
			var socket = new WebSocket('ws://localhost');
			socket.onopen = function(event) {
				console.log("Connection established!");
			}
			socket.onmessage = function(event) {
				console.log("Received data:");
				console.log(event.data);
				timeOut = setTimeout(disconnect, 5000 + (Math.random() * 120000));
			}
		});
	}
});

function disconnect() {
	console.log("KTHXBAI!");
	phantom.exit();
}