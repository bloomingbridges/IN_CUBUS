
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
        change: function(changeType, filePath, currentStat, previousStat){
            if (/*changeType === "create" || */changeType === "update") {
            	var index = filePath.substring(13,filePath.length-4);
            	console.log("UPDATED [" + filePath + "][" + index + "]");
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
  console.log("\n### TRANS//CUBUS is churning on " + address.port + "\n");
});

udp.bind(41234);
