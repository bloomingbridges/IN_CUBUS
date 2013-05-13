
var dgram = require('dgram')
var udp = dgram.createSocket('udp4');

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