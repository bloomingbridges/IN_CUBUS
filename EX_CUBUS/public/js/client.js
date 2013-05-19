
var pixel
	, pixelValues = ["#A3D9D8", "#D8D9A3", "#FF0000"]
	, index = 0
	, timer
	, socket;

$(document).ready(function() {
	pixel = $('#pixel');
	fitPixel();
	startPlayback();
	$(window).resize(function(e) {
		console.log("resizing..");
		fitPixel();
	});	
	setupSocket();
});

function fitPixel() {
	if (window.innerWidth < 768)
		pixel.css('height', window.innerWidth);
	else
		pixel.css('height', pixel.css('width'));
}

function startPlayback() {
	timer = window.setInterval(updatePixel, 1000/60);
}

function updatePixel() {
	index++;
	if (index === pixelValues.length)
		index = 0;
	$(pixel).css('background-color', pixelValues[index]);
}

function setupSocket() {
	
	console.log("Connecting to localhost:"+port);
	socket = new WebSocket('ws://localhost:'+port+'/');
	console.log(socket);

	socket.onopen = function() {
		console.log("YOPEN");
	};

	socket.onmessage = function(message) {
		console.log("YO "+message);
	};

	socket.onclose = function() {
		console.log("BYE");
	};

	socket.onerror = function(error) {
		console.log(error);
	}

}
