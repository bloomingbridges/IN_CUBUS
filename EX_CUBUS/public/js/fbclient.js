
$(document).ready {

	$('#help').hide();
	FB.init({ appId: APP_ID, channelUrl: 'http://incubus.bloomingbridges.co.uk/channel.html', status: true });

	FB.Event.subscribe('auth.statusChange', function(response) {
	  if (response.status === 'connected') {
	  	console.log("Logged in!");
	  	$('#front').hide();
	  	watchaKnowBoutMe(response);
	  }
	  else {
	  	console.log("Please log in..");
	  	FB.login(watchaKnowBoutMe);
	  }
	});

}

function watchaKnowBoutMe(response) {
	FB.api('/me', function(response) {
        //console.log(response);
        $('#info').html('<p>Hello ' + response.username + '</p>');
    });
}
