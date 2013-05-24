
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs') 
	, express = require('express')
	, http = require('http')
	, mongoose = require('mongoose')
	, ws = require('websocket.io');
	//, BinaryServer = require('binaryjs').BinaryServer;


// Models //////////////////////////////////////////////////////////////////////

var User = require('./models.js').User
	, Pixel = require('./models.js').Pixel


// Globals /////////////////////////////////////////////////////////////////////

var app = express()
	, server = http.createServer(app)
	, credentials = {}
	, socket
	, upstream
	, bServer
	, db;


// Setup ///////////////////////////////////////////////////////////////////////

fs.readFile(__dirname + '/credentials.json', 'utf8', function(error, data) {
	if (!error) {
		credentials = JSON.parse(data);
		init();
	}
	else
		console.log(error);
});

function init() {
	establishDatabaseConnection();
	setupExpressApp();
	setupSockets();
	//setupBinaryServer();
}

function establishDatabaseConnection() {

	var auth = credentials.db.USER + ':' + credentials.db.PWD + '@';
	var address = credentials.db.URL + credentials.db.NAME
	db = mongoose.createConnection('mongodb://' + auth + address);

	// Mongoose Handlers /////////////////////////////////////////////////////////

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function callback () {
	  console.log("Connection to DB established!");
	});

}

function setupExpressApp() {

	app.set('port', process.env.PORT || 3000);

	app.set('title', 'IN//CUBUS');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.static(__dirname + '/public'));

	// Routes ////////////////////////////////////////////////////////////////////

	app.get('/', function(req,res) {
		res.render('index',
				{ title: app.get('title'),
					port: app.get('port') }
			);
	});

	server.listen(app.get('port'), function(){
	  console.log("Express server listening on port " + app.get('port'));
	});

}

function setupSockets() {
	socket = ws.attach(server);
	socket.on('connection', onConnection);
}

// function setupBinaryServer() {
// 	bServer = new BinaryServer({server:server})
// 	bServer.on('connection', function(client) {
// 		client.on('error', function(error) {
// 			console.log(error.stack, error.message);
// 		});
// 	});
// }


// Sockets /////////////////////////////////////////////////////////////////////

function onConnection(client) {

	if (client.req.url === '/upstream') {

  	console.log("HELLO CHURN!");
  	client.on('message', onIncomingStream);
  	upstream = client;

  }
  else {

  	console.log("NEW CONNECTION!");
  	var newPosition = allocateNewRandomPosition();
	  var pixelArray = grabPixelArrayForPosition(newPosition);
	  var data = {position: indexToCoordinates(newPosition), pixels: pixelArray};
	  client.send(JSON.stringify(data));

	}

}

function onIncomingStream(message) {
	//console.log(message);
	var pixels = JSON.parse(message);
	if (pixels) {
		/*console.log("RECEIVED [" 
			+ pixels[0].step 
			+ ".png] " 
			+ ( pixels.length * 4 ) 
			+ " Bytes");*/
		var pixel;
		for (var i = 0; i < pixels.length; i++) {
			pixel = new Pixel(pixels[i]);
			pixel.save(function(err, pixel) {
				if (err)
					console.log(err);
				//else
					//console.log("Pixel saved to DB");
			});
		};
	}
}


// Helpers /////////////////////////////////////////////////////////////////////

function allocateNewRandomPosition() {
	var success, position;
	while (!success) {
		var position = Math.floor(Math.random() * (320*180));
		if (position) success = true;
	}
	return position;
}

function indexToCoordinates(index) {
	var x, y;
	y = Math.floor(index / 320);
	x = index - (y * 320);
	console.log(index + " -> X: " + x + ", Y: " + y);
	return {x:x, y:y};
}

function grabPixelArrayForPosition(position) {
	var array = [];
	for (var i = 0; i < 359; i++) {
		array.push({r:128, g:121, b:107});
	}
	return array;
}

