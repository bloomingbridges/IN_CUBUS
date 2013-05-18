
var pixel
	, pixelValues = ["#A3D9D8", "#D8D9A3", "#FF0000"]
	, index = 0
	, timer;

$(document).ready(function() {
	pixel = $('#pixel');
	fitPixel();
	startPlayback();
	$(window).resize(function(e) {
		console.log("resizing..");
		fitPixel();
	});	
});

function fitPixel() {
	if (window.innerWidth < 768)
		pixel.css('height', window.innerWidth);
	else
		pixel.css('height', pixel.css('width'));
}

function startPlayback() {
	timer = window.setInterval(updatePixel, 1000/60);
}

function updatePixel() {
	index++;
	if (index === pixelValues.length)
		index = 0;
	$(pixel).css('background-color', pixelValues[index]);
}