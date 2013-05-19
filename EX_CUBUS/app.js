
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs') 
	, express = require('express')
	, http = require('http')
	, mongoose = require('mongoose')
	, io = require('socket.io');


// Globals /////////////////////////////////////////////////////////////////////

var app = express()
	, server = http.createServer(app)
	, credentials = {}
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
}

function establishDatabaseConnection() {

	var auth = credentials.db.USER + ':' + credentials.db.PWD + '@';
	var address = credentials.db.URL + credentials.db.NAME
	mongoose.connect('mongodb://' + auth + address);
	db = mongoose.connection;

	// Mongoose Handlers /////////////////////////////////////////////////////////

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function callback () {
	  console.log("Connection to DB establishd!");
	});

}

function setupExpressApp() {

	app.set('title', 'IN//CUBUS');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.static(__dirname + '/public'));

	// Routes ////////////////////////////////////////////////////////////////////

	app.get('/', function(req,res) {
		res.render('index',
				{ title: app.get('title') }
			);
	});

	var port = (process.env.PORT) ? process.env.PORT : 3000;
	io.listen(server);
	app.listen(port);

}


// Sockets /////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function (socket) {
  console.log("NEW CONNECTION!");
});
