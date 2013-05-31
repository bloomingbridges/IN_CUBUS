
var pixel
	, pixelValues = ["#A3D9D8"]
	, index = 0
	, timer
	, socket
	, spazz = false;

$(document).ready(function() {
	$('#help').hide();
	$('#info').append('<p><a href="#help" id="expandHelp">//ABØUT</a></p>');
	$('a#expandHelp').on('click', function(event) {
		$('#help').show();
		$(event.target).remove();
	});
	if (Modernizr.websockets) {
		pixel = $('#pixel');
		pixel.show();
		fitPixel();
		startPlayback();
		$(window).resize(function(e) {
			fitPixel();
		});	
		setupSocket();
	} 
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
	
	if (port === 3000)
		socket = new WebSocket('ws://localhost:3000');
	else
		socket = new WebSocket('ws://incubus-7783.onmodulus.net/');

	$('#info p:first-child').html("Connecting..");

	socket.onopen = function() {
		//console.log("Connection established!");
		//$('#pixel').removeClass('connecting');
		//index = 0;
	};

	socket.onmessage = function(message) {
		var data = JSON.parse(message.data);
		if (data.position) {
			pixelValues = data.pixels;
			$('#info p:first-child').html("<p>You have been allocated<br />( X: <span>" 
				+ data.position.x + "</span> | Y: <span>" 
				+ data.position.y + '</span> )</p>');
			setTimeout(300, function() {
				$('#pixel').removeClass('connecting');
			});
		}
	};

	socket.onclose = function() {
		$('#pixel').removeClass('connecting');
		setPixelToSpazz();
	};

	socket.onerror = function(error) {
		console.log(error);
	}

}

function setPixelToSpazz() {
	pixelValues = ["#A3D9D8", "#D8D9A3", "#FF0000"];
	spazz = true;
	index = 0;
	$('#info').html("Connection lost..");
}
