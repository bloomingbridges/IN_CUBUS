
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs') 
	, express = require('express')
	, http = require('http')
	, mongoose = require('mongoose')
	, ws = require('websocket.io');


// Models //////////////////////////////////////////////////////////////////////

var User = require('./models.js').User
	, Pixel = require('./models.js').Pixel


// Globals /////////////////////////////////////////////////////////////////////

var app = express()
	, server = http.createServer(app)
	, credentials = {}
	, socket
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
}

function establishDatabaseConnection() {

	var auth = credentials.db.USER + ':' + credentials.db.PWD + '@';
	var address = credentials.db.URL + credentials.db.NAME
	db = mongoose.createConnection('mongodb://' + auth + address);

	// Mongoose Handlers /////////////////////////////////////////////////////////

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function callback () {
	  console.log("Connection to DB establishd!");
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


// Sockets /////////////////////////////////////////////////////////////////////

function onConnection(client) {

  console.log("NEW CONNECTION!");
  var pixelArray = grabPixelArrayForPosition(0);
  var data = {position: {x: 1, y: 1}, pixels: pixelArray};
  client.send(JSON.stringify(data));

  client.on('message', function(message) {

  });
}

function grabPixelArrayForPosition(position) {
	var array = [];
	for (var i = 0; i < 359; i++) {
		array.push({r:128, g:121, b:107});
	}
	return array;
}

