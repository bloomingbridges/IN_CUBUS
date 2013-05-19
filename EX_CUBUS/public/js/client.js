
var pixel
	, pixelValues = ["#A3D9D8"]
	, index = 0
	, timer
	, socket
	, spazz = false;

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
	if (index >= pixelValues.length)
		index = 0;
	var p = pixelValues[index];
	var colour = (typeof p === 'object') ? 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')' : p;
	$(pixel).css('background-color', colour);
}

function setupSocket() {
	
	//console.log("Connecting to localhost:"+port);
	socket = new WebSocket('ws://localhost:'+port+'/');

	socket.onopen = function() {
		console.log("Connection established!");
		//pixelValues = [{r:"255",g:"0",b:"255"}];
		//index = 0;
	};

	socket.onmessage = function(message) {
		var data = JSON.parse(message.data);
		pixelValues = data.pixels;
		$('#info').html("You have been allocated ( X: " + data.position.x + " | Y: " + data.position.y + " )");
		$('#info').append(' <a href="#">info</a> <a href="#">increase</a>');
	};

	socket.onclose = function() {
		setPixelToSpazz();
	};

	socket.onerror = function(error) {
		setPixelToSpazz();
	}

}

function setPixelToSpazz() {
	pixelValues = ["#A3D9D8", "#D8D9A3", "#FF0000"];
	spazz = true;
	index = 0;
	$('#info').html("Connection lost..");
}
