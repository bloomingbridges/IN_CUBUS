
var fs = require('fs'), 
	express = require('express'),
	http = require('http'),
	mongoose = require('mongoose');
	io = require('socket.io');

var app = express(),
	server = http.createServer(app),
	credentials = {};

fs.readFile(__dirname + '/credentials.json', 'utf8', function(error, data) {
	if (!error) {
		credentials = JSON.parse(data);
		setupExpressApp();
	}
	else
		console.log(error);
});


function setupExpressApp() {

	app.set('title', 'IN//CUBUS');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.static(__dirname + '/public'));

	app.get('/', function(req,res) {
		res.render('index',
				{ title: app.get('title') }
			);
	});

	var port = (process.env.PORT) ? process.env.PORT : 3000;
	io.listen(server);
	app.listen(port);

}

