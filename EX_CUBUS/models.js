
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	position: {type: Number, unique: true},
	authenticated: {type: Boolean, default: false}
});

var pixelSchema = mongoose.Schema({
	position: Number,
	step: Number,
	r: {type: Number, default: 128},
	g: {type: Number, default: 121},
	b: {type: Number, default: 107},
});

module.exports.UserSchema = userSchema;
module.exports.PixelSchema = pixelSchema;