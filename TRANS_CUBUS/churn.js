
// Modules /////////////////////////////////////////////////////////////////////

var dgram = require('dgram'),
	watchr = require('watchr');

// Globals /////////////////////////////////////////////////////////////////////

var udp = dgram.createSocket('udp4');

// Watchr //////////////////////////////////////////////////////////////////////

watchr.watch({
	path: "../IN_COMING/",
	listeners: {
        error: function(err){
            console.log('Watchr ERROR: ', err);
        },
        change: function(changeType,filePath,fileCurrentStat,filePreviousStat){
            if (changeType === "create" || changeType === "update") {
            	var index = filePath.match(/([0-360])/)[1];
            	console.log("FRESH [" + index + "]");
            }
            //console.log('CHANGE: ', arguments);
        }
	}
});

// UDP /////////////////////////////////////////////////////////////////////////

udp.on("message", function (msg, rinfo) {
  console.log("Receiving: " + msg + " from " +
    rinfo.address + ":" + rinfo.port);
});

udp.on("listening", function () {
  var address = udp.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

udp.bind(41234);
