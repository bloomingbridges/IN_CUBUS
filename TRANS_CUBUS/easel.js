
var Canvas = require('canvas')
	, fs = require('fs');

var Easel = function(src) {

	this.canvas = new Canvas(320,180);
	this.context = this.canvas.getContext('2d');
	this.source = src;
	this.image = null;
	this.holdsFreshData = false;

}

Easel.prototype = {

	refresh: function(buffer) {
		this.image = new Canvas.Image;
		this.image.src = new Buffer(buffer, 'binary');
		console.log(this.source + " REFRESHING..");
		var self = this;
		setTimeout(function() {
			self.draw();
		}, 100);
	},

	isFresh: function() {
		return this.holdsFreshData;
	},

	draw: function() {
		this.context.drawImage(this.image, 0, 0);
		this.holdsFreshData = true;
		console.log(this.source + " REDRAWN!");
	},

	extractPixels: function() {
		this.holdsFreshData = false;
		return this.canvas.toBuffer();
	}

}

module.exports = Easel;