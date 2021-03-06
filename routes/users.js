var express = require('express');
var request = require('request');
var router = express.Router();
var q = require('q');

module.exports = function() {

	router.get('/getFavoriteList', function(req, res) {
    	var senderId = req.query.senderId;
    	getFavoriteList(senderId).then(function(response) {
    		console.log("final response");
           console.log(response);
    	 }, function(error) {
        		console.error(error);
    	});
    	

    });

    router.get('/getUserDetailsbyId', function(req, res) {
    	var userId = req.query.userId;
    	var Users = require(__base + 'models/users');
			Users.find({fbId:userId}, function(err, users) {
				if (err) console.log(err);
				res.json(users[0].imageUrl);
		});
    	

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

    var query = {"fbId": senderId},
    update = { name: senderData.name,
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
		  roles: 'user'},
    options = { upsert: true, new: true, setDefaultsOnInsert: true };

	// Find the document
	Users.findOneAndUpdate(query, update, options, function(error, result) {
    	if (error) return;
    	console.log('user created!');
	});

}


/*
 * Get the favorite list
 *
 */
function getFavoriteList(senderId) {
    console.log("Getting the favorite show for the user: " + senderId );

	var Shows = require(__base + 'models/shows');
	var deferred = q.defer();

	Shows.find({}, function(err, shows) {
		if (err) console.log(err);
		console.log('1');
		console.log(shows);
		console.log('2');
		global.showsList = shows;
		global.sId = senderId;
		console.log('3');

		
        var Users = require(__base + 'models/users');
        Users.find({fbId:senderId}, function(err, users) {
				if (err) console.log(err);
				var likesList = users[0].likes;
				console.log(likesList);
				finalLikesArr = [];
				for(var j = 0; j< global.showsList.length; j++){
					console.log(global.showsList[j].name);
					console.log(global.showsList[j].favUserList);
					console.log(likesList.includes(global.showsList[j].name));
					console.log(typeof global.showsList[j].favUserList != 'undefined' && !global.showsList[j].favUserList.includes(global.sId));

					if(likesList.includes(global.showsList[j].name) && (typeof global.showsList[j].favUserList != 'undefined') && !global.showsList[j].favUserList.includes(global.sId)){
						finalLikesArr.push(global.showsList[j]);
					}

					console.log(finalLikesArr)
				}
				deferred.resolve(finalLikesArr)
		});
	});
	return deferred.promise;
    
}

/*
 * Get the generic list
 *
 */
function getGenericList(senderId) {
    console.log("Getting the favorite show for the user: " + senderId );

	var Shows = require(__base + 'models/shows');
	var deferred = q.defer();

	Shows.find({}, function(err, shows) {
		if (err) console.log(err);
		console.log('1');
		console.log(shows);
		console.log('2');
		global.showsList = shows;
		console.log('3');
		global.sId = senderId;
		
        var Users = require(__base + 'models/users');
        Users.find({fbId:senderId}, function(err, users) {
				if (err) console.log(err);
				var likesList = users[0].likes;
				console.log(likesList);
				finalLikesArr = [];
				for(var j = 0; j< global.showsList.length; j++){
					console.log(global.showsList[j].name);
					console.log(global.showsList[j].favUserList);
					if((typeof global.showsList[j].favUserList != 'undefined') && !global.showsList[j].favUserList.includes(global.sId)){
						finalLikesArr.push(global.showsList[j]);
					}
				}
				deferred.resolve(finalLikesArr);
		});
	});
	return deferred.promise;
    
}





module.exports.saveUserProfileData = saveUserProfileData;
module.exports.getFavoriteList = getFavoriteList;
module.exports.getGenericList = getGenericList;