
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: String,
	position: {type: Number, unique: true}
});

var pixelSchema = mongoose.Schema({
	owner: String,
	position: Number,
	r: {type: Number, default: 128},
	g: {type: Number, default: 121},
	b: {type: Number, default: 107},
});

module.exports.UserSchema = userSchema;
module.exports.PixelSchema = pixelSchema;