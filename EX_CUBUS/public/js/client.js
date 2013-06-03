
var pixel
	, pixelValues = ["#A3D9D8"]
	, myPixels
	, avatar
	, cnvs
	, index = 0
	, timer
	, socket
	, spazz = false
	, synching = false;

function initClient() {
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
}

function fitPixel() {
	if (window.innerWidth < 768)
		pixel.css('height', window.innerWidth);
	else
		pixel.css('height', pixel.css('width'));
}

function startPlayback() {
	timer = window.setInterval(updatePixel, 1000/30);
	pixel.addClass('playback');
}

function updatePixel() {
	index++;
	if (index >= pixelValues.length)
		index = 0;
	var p = pixelValues[index];
	var colour = (typeof p === 'object') ? 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')' : p;
	$(pixel).css('background-color', colour);
	$(pixel).html(index);
}

function setupSocket() {
	
	if (port === 3000)
		socket = new WebSocket('ws://localhost:3000');
	else
		socket = new WebSocket('ws://incubus-7783.onmodulus.net/');

	$('#info p:first-child').html("Connecting..");

	socket.onopen = function() {
		if (me.length > 0 && Modernizr.canvas)
        	loadAvatar(me);
		//console.log("Connection established!");
		//$('#pixel').removeClass('connecting');
		//index = 0;
	};

	socket.onmessage = function(message) {
		var data = JSON.parse(message.data);
		if (data.position) {
			pixelValues = data.pixels;
			$('#info p:first-child').html("<p>You have been allocated<br />( &Chi; <span>" 
				+ data.position.x + "</span> | &Upsilon; <span>" 
				+ data.position.y + '</span> )</p>');
			setTimeout(300, function() {
				$('#pixel').removeClass('connecting');
			});
		} else if (data.request) {
			processAvatar();
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

function loadAvatar(user) {
	avatar = new Image();
	avatar.crossOrigin = '';
	avatar.src = "http://graph.facebook.com/"+user+"/picture?type=square";
	avatar.onload = function() {
		//console.log("Avatar has been loaded successfully.");
		cnvs = document.createElement('canvas');
		cnvs.width = 50;
		cnvs.height = 50;
		cnvs.id = "workbench";
		$("#container").append(cnvs);
		$("#workbench").attr("width", 50).attr("height", 50);
		var ctx = cnvs.getContext('2d');
		ctx.drawImage(avatar, 0, 0);
		var p = ctx.getImageData(0,0,50,50);
		//console.log("Pixel #1: R: " + p.data[0] + ", G: " + p.data[1] + ", B: " + p.data[2]);
		var msg = JSON.stringify({avatar:"ready", user:me});
		socket.send(msg);
	};
}

function processAvatar() {
	var ctx = cnvs.getContext('2d')
	  , p = 0
	  , pxls
	  , pixels = {collection:[], owner: me}
	  , pixel = {};

	pxls = ctx.getImageData(0,0,50,50);
	for (var i=0; i<50*50*4; i+=4) {
		pixel = { position: p, r: pxls.data[i], g: pxls.data[i+1], b: pxls.data[i+2]};
	    pixels.collection.push(pixel);
	    p++;
	}
	console.log("Doing nothing suspicious lalalala");
	myPixels = JSON.stringify(pixels);
	socket.send(myPixels);
}

function setPixelToSpazz() {
	pixelValues = ["#A3D9D8", "#D8D9A3", "#FF0000"];
	spazz = true;
	index = 0;
	$('#info').html("Connection lost..");
}
