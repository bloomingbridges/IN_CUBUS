
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs')
  , dgram = require('dgram')
  ,	watchr = require('watchr')
  , canvas = require('canvas')
  , Easel = require('./easel.js')
  , mongoose = require('mongoose')
  , Websocket = require('ws')
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
  , easels = []
  , counter = 0
  , workers = 0
  , maxWorkers = 1
  , timer
  , bClient
  , stream
  , readyToStream
  , db;


// Setup ///////////////////////////////////////////////////////////////////////

var filePath = __dirname + '/../EX_CUBUS/credentials.json';
fs.readFile(filePath, 'utf8', function(error, data) {
  if (!error) {
    credentials = JSON.parse(data);
    setupEasels();
    setupUpStream();
  }
  else
    console.log(error);
});

// function setupStream() {
//   bClient = new BinaryClient('ws://incubus-7783.onmodulus.net/upstream');
//   bClient.on('open', function() {
//     readyToStream = true;
//     console.log("SUCK MY STREAM!");
//   });
//   bClient.on('error', function(error) {
//     console.log(error);
//   });
// }

function setupEasels() {
  for (var e=0; e<360; e++) {
    easels.push( new Easel('../IN_COMING/'+e+'.png') );
  }
}

function setupUpStream() {
  stream = new Websocket('ws://incubus-7783.onmodulus.net/upstream');
  //stream = new Websocket('ws://localhost:3000/upstream');
  stream.on('open', function() {
    readyToStream = true;
    console.log("SUCK MY STREAM!");
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
        //easels[index].refresh(fs.readFileSync(__dirname+"/"+filePath));
        fs.readFile(__dirname+"/"+filePath, function(err, data){
          if (!err)
            easels[index].refresh(data);
          else
            console.log(err);
        });
        // if (queue.indexOf(index) === -1) {
        //   queue.push(index);
        //   if (!churning)
        //     startChurning();
        // }
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
  timer = setInterval(checkForJobs, 100);
}

function checkForJobs() {
  if (churn.length > 0) {
     if (workers < maxWorkers) {
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
  var pData = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
  var pixels = [];
  var pixel = {};
  for (var i=0; i<(320*180*4); i+=4) {
    pixel = { step: job.step, position: i, r: pData.data[i], g: pData.data[i+1], b: pData.data[i+2]};
    //console.log(pixel);
    pixels.push(pixel);
    if (i % 16 === 0) {
      stream.send(JSON.stringify(pixels));
      pixels = [];
    }
  }
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

