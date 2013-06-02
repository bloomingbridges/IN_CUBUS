
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs') 
	, express = require('express')
	, http = require('http')
	, mongoose = require('mongoose')
	, ws = require('websocket.io')
	, fb = require('facebook-node-sdk');
	//, BinaryServer = require('binaryjs').BinaryServer;


// Models //////////////////////////////////////////////////////////////////////

var User, Pixel;


// Constants ///////////////////////////////////////////////////////////////////

var WIDTH = HEIGHT = 50;


// Globals /////////////////////////////////////////////////////////////////////

var app = express()
	, server = http.createServer(app)
	, credentials = {}
  , clients = []
  , clientHistory = []
	, socket
	, mediator
	, flushTimer = null
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

	if (app.get('env') === 'development')
		mongoose.set('debug', true);

	db.on('error', console.error.bind(console, 'connection error:'));

	db.once('open', function() {
	  console.log("Connection to DB established!");
	  User = db.model('User', require('./models.js').UserSchema);
		Pixel = db.model('Pixel', require('./models.js').PixelSchema);
	});

}

function setupExpressApp() {

	app.set('port', process.env.PORT || 3000);

	app.set('title', 'IN//CUBUS');
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'blargh' }));
	app.use(fb.middleware({appId: credentials.fb.APP_ID, 
		secret: credentials.fb.APP_SECRET}));
	app.use(express.static(__dirname + '/public'));

	// Routes ////////////////////////////////////////////////////////////////////

	app.get('/', function(req,res) {
		res.render('index', { 
			title: app.get('title'),
			port: app.get('port'),
			me: ""
		});
	});

	app.get('/about', function(req,res) {
		res.render('about', { 
			title: app.get('title')
		});
	});

	app.post('/', fb.loginRequired(), function(req,res) {
		var options = {title: app.get('title'), port: app.get('port'), me: ""};
		req.facebook.api('/me', function(err, user) {
			if (clientHistory.indexOf(user.username) === -1) {
				//clientHistory.push(user.username);
				//if (mediator) mediator.send(JSON.stringify({visiting:user.username}));
				options.me = user.username;
			}
			res.render('index', options);
		});
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
  	//client.on('message', onIncomingStream);
  	upstream = client;

  } else if (client.req.url === '/notifications') {

  	console.log("HELLO MEDIATOR!");
  	client.on('message', onMediatorMessage);
  	mediator = client;

  } else {

  	console.log("NEW CONNECTION!");
  	var newPosition = allocateNewRandomPosition(false);
	  var pixelArray = grabPixelArrayForPosition(newPosition);
	  var data = {position: indexToCoordinates(newPosition), pixels: pixelArray};
	  client.send(JSON.stringify(data));
	  if (mediator) mediator.send(JSON.stringify({created:newPosition}));
	  var newUser = new User({position:newPosition, authenticated:false});
	  newUser.save(onSavedToMongoDB);
	  client.id = newPosition;
	  client.on('message', function(msg) {
	  	msg = JSON.parse(msg);
	  	if (msg.avatar) {
	  		console.log('#'+client.id+" says: "+msg.avatar);
	  		client.send(JSON.stringify({request:"PIXELS PLEASE!"}));
	  	}
	  	else if (msg.collection) {
	  		console.log("Received fresh pixels from #"+client.id);
	  		savePixelsToDB(client.id, msg.owner, msg.collection);
	  	}
	  });
	  client.on('close', function() {
	  	if (mediator) mediator.send(JSON.stringify({left:client.id}));
	  	console.log('#' + client.id + " has left.");
	  	User.remove({position:client.id}, function(error) {
	  		if (error)
	  			console.log(error);
	  		else
	  			console.log("DB entry has been removed successfully!");
	  	});
	  	// TODO notify cube etc.
	  });

	}

}

function onSavedToMongoDB(error) {
	if (!error) {
		console.log("DATA SUCCESSFULLY STORED IN DATABASE");
		User.find(updateInventory);
	}
	else
		console.log(error);
}

function updateInventory(error, items) {
	if (!error)
		clients = items;
	else console.log(error);
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
					//console.log("PIXEL SAVED TO DB");
			});
		};
	}
}

function savePixelsToDB(clientID, clientName, pixels) {
	var pixel;
	for (var i = 0; i < pixels.length; i++) {
		pixel = new Pixel(pixels[i]);
		pixel.owner = clientName;
		pixel.step = clientID;
		pixel.save(onPixelSaved);
	}
	// TODO Send updated pixels to all connected clients
	// TODO Send out synch date
}

function onPixelSaved(err, pixel) {
	if (err)
		console.log(err);
	//else
		//console.log("PIXEL SAVED TO DB");
}

function onMediatorMessage(message) {
	var msg = JSON.parse(message);
	if (msg.cmd && msg.cmd === "FLUSH") {
		if (flushTimer === null) {
			console.log("!!! About to drop the database. Send again to cancel.");
			flushTimer = setTimeout(flushDatabase, 10000);
		} else {
			clearInterval(flushTimer);
			flushTimer = null;
			console.log("!!! Database flush aborted.");
		}
	}
}

function flushDatabase() {
	Pixel.remove({}, onDBFlushError);
	User.remove({}, onDBFlushError);
	flushTimer = null;
	console.log("!!! Database empty?");
	mediator.send(JSON.stringify({confirmation:"DB has been emptied!"}));
}

function onDBFlushError(error) {
	if (error) console.log(error);
}


// Helpers /////////////////////////////////////////////////////////////////////

function allocateNewRandomPosition(leaveGaps) {
	var success, position, filledPositions;
	while (!success) {
		filledPositions = clients;
		//console.log("OCCUPIED POSITIONS: ");
		//console.log(filledPositions);
		if (leaveGaps) {
			position = (WIDTH-1) + Math.floor(Math.random() * ((WIDTH-2)*HEIGHT));
			if (filledPositions.indexOf(position) === -1) {
				if (hasDistanceFromEdge(position)) {
					success = hasNoImmediateNeighbours(position, filledPositions);
				}
			}
	  } else {
	  	position = Math.floor(Math.random() * ( WIDTH * HEIGHT ));
	  	success = (filledPositions.indexOf(position) === -1);
	  }
	}
	return position;
}

function getOccupiedPixels() {
	var posArray = [];
	for (var c in clients) {
		posArray.push(c.position);
	}
	return posArray;
}

function hasDistanceFromEdge(position) {
	return (position % WIDTH !== 0 && position % (WIDTH-1) !== 0) ? true : false;
}

function hasNoImmediateNeighbours(position, occupied) {
	if (occupied.indexOf(position-320) === -1) {
		if (occupied.indexOf(position+320 === -1)) {
			if (occupied.indexOf(position-1) === -1) {
				if (occupied.indexOf(position+1) === -1) {
					if (occupied.indexOf(position-321) === -1) {
						if (occupied.indexOf(position-319) === -1) {
							if (occupied.indexOf(position+319) === -1) {
								if (occupied.indexOf(position+321) === -1) {
									return true;
								}
							}
						}
					}
				}
			}
		}
	}
	else {
		return false;
	}
}

function indexToCoordinates(index) {
	var x, y;
	y = Math.floor(index / WIDTH);
	x = index - (y * WIDTH);
	console.log(index + " -> X: " + x + ", Y: " + y);
	return {x:x, y:y};
}

function grabPixelArrayForPosition(position) {
	var array = [];
	for (var i = 0; i < (WIDTH*HEIGHT); i++) {
		var randR = 47 + Math.floor(Math.random() * 60);
    var randG = 84 + Math.floor(Math.random() * 40);
    var randB = 107 + Math.floor(Math.random() * 10);
    array.push({r:randR, g:randG, b:randB});
		//array.push({r:128, g:121, b:107});
	}
	return array;
}

