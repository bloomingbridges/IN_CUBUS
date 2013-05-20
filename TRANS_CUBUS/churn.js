
// Modules /////////////////////////////////////////////////////////////////////

var fs = require('fs')
  , dgram = require('dgram')
  ,	watchr = require('watchr')
  , canvas = require('canvas')
  , mongoose = require('mongoose');


// Models //////////////////////////////////////////////////////////////////////

var User = require('../EX_CUBUS/models.js').User
  , Pixel = require('../EX_CUBUS/models.js').Pixel;


// Globals /////////////////////////////////////////////////////////////////////

var udp = dgram.createSocket('udp4')
  , credentials = {}
  , churning = false
  , queue = []
  , counter = 0
  , timer
  , db;


// Setup ///////////////////////////////////////////////////////////////////////

var filePath = __dirname + '/../EX_CUBUS/credentials.json';
fs.readFile(filePath, 'utf8', function(error, data) {
  if (!error) {
    credentials = JSON.parse(data);
    establishDatabaseConnection();
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
        startChurning();
      }
    }
	}
});

function startChurning() {
  if (!churning && counter === 360) {
    setTimeout(function() {
      //timer = setInterval(churn, 100);
      loadImages();
      churning = true;
    }, 3000);
  } 
  else if (churning) {
    if (queue.length > 0)
      console.log("chrng.. " + queue.shift().step);
  } else {
    counter++;
  }
}

function loadImages() {
  var filesHandled = 0;
  for (var i=0; i<359; i++) {
    var source = '../IN_COMING/' + i + '.png';
    console.log("chrnnn.. " + source);
    var imgdata = fs.readFileSync(source);

    var cnvs = new canvas(320,180)
      , ctx = cnvs.getContext('2d')
      , img = new canvas.Image;
    
    img.onload = function() {
      ctx.drawImage(img, 0, 0);
      queue.push({step: i, data: cnvs});
      // var imgData = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
      // //console.log('[' + index + '] (1,1): ' + imgData.data[0] + ', ' + imgData.data[1] + ', ' + imgData.data[2]);
      // console.log(Math.ceil(i/360 * 100) + "%");
      // filesHandled++;
      // if (filesHandled === 360) {
      //   churning = false;
      //   console.log("DONE CHURNING!");
      // }
      delete imgdata;
    }

    img.src = imgdata;
  }
  
}

// function churn() {
//   if (queue.length > 0) {
//     var index = queue.shift();
//     var source = '../IN_COMING/' + index + '.png';
//     console.log("chrnnn.. " + source);
//     fs.readFile(source, function(err, imgdata) {
//       if (err) throw err;
//       var cnvs = new canvas(320,180)
//         , ctx = cnvs.getContext('2d')
//         , img = new canvas.Image;
      
//       img.onload = function() {
//         ctx.drawImage(img, 0, 0);
//         var imgData = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
//         //console.log('[' + index + '] (1,1): ' + imgData.data[0] + ', ' + imgData.data[1] + ', ' + imgData.data[2]);
//         console.log(Math.ceil(index/360 * 100) + "%");
//       }

//       img.src = imgdata;

//     });
//   }
//   else {
//     churning = false;
//     clearInterval(timer);
//     console.log("DONE CHURNING!");
//   }
// }


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

