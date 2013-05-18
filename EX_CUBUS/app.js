
var express = require('express');
var app = express();

app.set('title', 'IN//CUBUS');
//app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
//app.use(express.static(__dirname + '/public'));

app.get('/', function(req,res) {
	res.end("blargh");
});

app.listen(process.env.PORT);