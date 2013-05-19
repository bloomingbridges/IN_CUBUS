
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	id: String,
	position: Number,
	authenticated: {type: Boolean, default: false}
});

var pixelSchema = mongoose.Schema({
	position: Number,
	step: Number,
	r: {type: Number, default: 128},
	g: {type: Number, default: 121},
	b: {type: Number, default: 107},
});

module.exports.User = mongoose.model('User', userSchema);
module.exports.Pixel = mongoose.model('Pixel', pixelSchema);