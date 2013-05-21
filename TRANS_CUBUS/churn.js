
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs')
  , dgram = require('dgram')
  ,	watchr = require('watchr')
  , canvas = require('canvas')
  , mongoose = require('mongoose')
  , BinaryClient = require('binaryjs').BinaryClient;


// Models //////////////////////////////////////////////////////////////////////

var User = require('../EX_CUBUS/models.js').User
  , Pixel = require('../EX_CUBUS/models.js').Pixel;


// Globals /////////////////////////////////////////////////////////////////////

var udp = dgram.createSocket('udp4')
  , credentials = {}
  , churning = false
  , queue = []
  , churn = []
  , counter = 0
  , workers = 0
  , timer
  , bClient
  , readyToStream
  , db;


// Setup ///////////////////////////////////////////////////////////////////////

var filePath = __dirname + '/../EX_CUBUS/credentials.json';
fs.readFile(filePath, 'utf8', function(error, data) {
  if (!error) {
    credentials = JSON.parse(data);
    //establishDatabaseConnection();
    setupStream();
  }
  else
    console.log(error);
});

function establishDatabaseConnection() {

  var auth = 'churn' + ':' + credentials.db.PWD + '@';
  var address = credentials.db.URL + credentials.db.NAME;
  db = mongoose.createConnection('mongodb://' + auth + address);

  // Mongoose Handlers /////////////////////////////////////////////////////////

  db.on('error', console.error.bind(console, 'Connection error:'));

  db.once('open', function callback () {
    console.log("Connection to DB establishd!");
  });

}

function setupStream() {
  bClient = new BinaryClient('ws://incubus-7783.onmodulus.net:3000/upstream');
  bClient.on('open', function() {
    readyToStream = true;
    console.log("SUCK MY STREAM!");
  });
  bClient.on('error', function(error) {
    console.log(error);
  });
}


// Watchr //////////////////////////////////////////////////////////////////////

watchr.watch({
	path: "../IN_COMING/",
	listeners: {
    error: function(err){
      console.log('Watchr ERROR: ', err);
    },
    change: function(changeType, filePath, currentStat, previousStat){
      if (/*changeType === "create" || */changeType === "update") {
      	var index = filePath.substring(13,filePath.length-4);
      	console.log("UPDATED [" + index + '] "' + filePath + '"');
        if (queue.indexOf(index) === -1) {
          queue.push(index);
          if (!churning)
            startChurning();
        }
      }
    }
	}
});

function startChurning() {
  if (!churning) {
    churning = true;
    setTimeout(function() {
      loadImages();
    }, 15000);
  } 
}

function loadImages() {
  while (queue.length > 0) {
    var index = queue.shift();
    var source = '../IN_COMING/' + index + '.png';
    churn.push({step: index, data: fs.readFileSync(source)});
  }
  timer = setInterval(checkForJobs, 10);
}

function checkForJobs() {
  if (churn.length > 0) {
     if (workers < 10) {
        spawnWorker(churn.shift());
        workers++;
      }
  }
  else {
    churning = false;
    clearInterval(timer);
    console.log("DONE CHURNING!");
  }
}

function spawnWorker(job) {
  if (queue.indexOf(job.step) === -1)
    console.log("PROCESSING [" + job.step + "]");
  var cnvs = new canvas(320,180)
    , ctx = cnvs.getContext('2d')
    , img = new canvas.Image;
  img.src = job.data;
  ctx.drawImage(img, 0, 0);
  var imgData = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
  console.log('[' + job.step + '] (1,1): ' + imgData.data[0] + ', ' + imgData.data[1] + ', ' + imgData.data[2]);
  workers--;
}


// UDP /////////////////////////////////////////////////////////////////////////

udp.on("message", function (msg, rinfo) {
  console.log("Receiving: " + msg + " from " +
    rinfo.address + ":" + rinfo.port);
});

udp.on("listening", function () {
  var address = udp.address();
  console.log("\n### TRANS//CUBUS is churning on " + address.port + "\n");
});

udp.bind(41234);

