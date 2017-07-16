var express = require('express');
var request = require('request');
var router = express.Router();

module.exports = function() {


	router.get('/sendPushMessage', function(req, res) {
    	var result='Say Kevin to start';

    });

	return router;

}



/*
 * Save the user details
 *
 */
function saveUserProfileData(senderId, senderData) {
    console.log("SAving the user data: " + senderId + ":=" + senderData);


    var Users = require(__base + 'models/users');

    var listOfLikes = senderData.likes.data;
    console.log(listOfLikes);
    var likesArr = [];
    for(var i = 0 ; i < listOfLikes.length ; i++){
    	likesArr.push(listOfLikes[i].name);
    }
    console.log(likesArr);

    var listOfMovies = senderData.movies.data;
    console.log(listOfMovies);

    var moviesArr = [];
    for(var i = 0 ; i < listOfMovies.length ; i++){
    	moviesArr.push(listOfMovies[i].name);
    }

    console.log(moviesArr);
	var users = Users({
		  name: senderData.name,
		  timezone: senderData.timezone,
		  birthday: senderData.birthday,
		  location: senderData.location.name,
		  locale: senderData.locale,
		  email: senderData.email,
		  imageUrl: senderData.picture.data.url,
		  gender: senderData.gender,
		  likes: likesArr,
		  movies: moviesArr,
		  fbId: senderId,
		  roles: 'user'
	});

	users.save(function(err) {
		if (err) next(err);

		console.log('user created!');
		res.send('user created!');
	});
}

module.exports.saveUserProfileData = saveUserProfileData;