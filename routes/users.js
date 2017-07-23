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
					if(likesList.includes(global.showsList[j].name) && (typeof global.showsList[j].favUserList != 'undefined') && !global.showsList[j].favUserList.includes(global.sId)){
						finalLikesArr.push(global.showsList[j]);
					}
					console.log("Final likes")

					finalLikesArr=[{"_id":"5974c7e5d4e9433414d30bf9","name":"Access Hollywood","startTime":"21:00","endTime":"22:00","imageURL":"https://img.nbc.com/sites/nbcunbc/files/files/styles/640x360/public/images/2017/4/06/AccessHollywood-ShowsPage-1920x1080-KO.jpg?itok=65iXlYiw&impolicy=nbc_com&imwidth=320","videoURL":"https://www.youtube.com/watch?v=0y-R-0CgOyk","description":"This long-running entertainment-focused show is heavy on celebrity gossip and behind-the-scenes stories in Hollywood. A team of correspondents presents stories and celebrity interviews, all focused on the latest happenings in the entertainment industry. The show often features reports originating from the red carpet at major award shows, movie premieres and other key Hollywood events. An hourlong weekend version is less news-heavy and focuses on in-depth feature stories and themed shows. Natalie Morales currently hosts the daily show.","__v":0,"tags":["reality"," news"],"favUserList":["1128081597293753","1401498756564673"]},{"_id":"5974c8530fb00e367e62edae","name":"America's Got Talent","startTime":"19:00","endTime":"20:00","imageURL":"http://digitalspyuk.cdnds.net/16/21/980x490/landscape-1464273876-agt-s11-key-art.jpg","videoURL":"https://www.youtube.com/watch?v=0Opr_uoVlF8","description":"A nationwide search among a pool of amateurs for the best talent in singing, dancing, comedy and novelty acts. Viewers choose who will advance to the next round to ultimately win a huge prize.","__v":0,"tags":["reality"," talent"," comedy"," fun"],"favUserList":["1128081597293753","1401498756564673","1401498756564673"]},{"_id":"5974c8a60fb00e367e62edaf","name":"American Ninja Warrior","startTime":"22:00","endTime":"23:00","imageURL":"https://img.nbc.com/sites/nbcunbc/files/files/styles/640x360/public/images/2017/6/27/ANW-Girl-ShowImage-1920x1080-KO.jpg?itok=ybBkBBrl&impolicy=nbc_com&imwidth=320","videoURL":"https://www.youtube.com/watch?v=jCUsHAgxPbc","description":"Several competitors try to accomplish difficult feats in order to win the coveted title.","__v":0,"tags":["reality"," fun"," adventure"],"favUserList":["1401498756564673","1128081597293753"]},{"_id":"5974c8fb0fb00e367e62edb0","name":"Blindspot","startTime":"10:00","endTime":"11:00","imageURL":"https://img.nbc.com/sites/nbcunbc/files/files/styles/640x360/public/images/2016/7/27/2016-0718-Blindspot-AboutImage-1920x1080-KO1.jpg?itok=wj2x8PEn&impolicy=nbc_com&imwidth=320","videoURL":"https://www.youtube.com/watch?v=biSRZM1NLDs","description":"When a strange woman finds herself in Times Square with absolutely no memory of her past and mysterious tattoos all over her body, she embarks on a journey to determine her identity.","__v":0,"tags":["thriller"," fantasy"," adventure"],"favUserList":["1401498756564673","1128081597293753"]}];
					console.log(finalLikesArr)
				}
				deferred.resolve([{"_id":"5974c7e5d4e9433414d30bf9","name":"Access Hollywood","startTime":"21:00","endTime":"22:00","imageURL":"https://img.nbc.com/sites/nbcunbc/files/files/styles/640x360/public/images/2017/4/06/AccessHollywood-ShowsPage-1920x1080-KO.jpg?itok=65iXlYiw&impolicy=nbc_com&imwidth=320","videoURL":"https://www.youtube.com/watch?v=0y-R-0CgOyk","description":"This long-running entertainment-focused show is heavy on celebrity gossip and behind-the-scenes stories in Hollywood. A team of correspondents presents stories and celebrity interviews, all focused on the latest happenings in the entertainment industry. The show often features reports originating from the red carpet at major award shows, movie premieres and other key Hollywood events. An hourlong weekend version is less news-heavy and focuses on in-depth feature stories and themed shows. Natalie Morales currently hosts the daily show.","__v":0,"tags":["reality"," news"],"favUserList":["1128081597293753","1401498756564673"]},{"_id":"5974c8530fb00e367e62edae","name":"America's Got Talent","startTime":"19:00","endTime":"20:00","imageURL":"http://digitalspyuk.cdnds.net/16/21/980x490/landscape-1464273876-agt-s11-key-art.jpg","videoURL":"https://www.youtube.com/watch?v=0Opr_uoVlF8","description":"A nationwide search among a pool of amateurs for the best talent in singing, dancing, comedy and novelty acts. Viewers choose who will advance to the next round to ultimately win a huge prize.","__v":0,"tags":["reality"," talent"," comedy"," fun"],"favUserList":["1128081597293753","1401498756564673","1401498756564673"]},{"_id":"5974c8a60fb00e367e62edaf","name":"American Ninja Warrior","startTime":"22:00","endTime":"23:00","imageURL":"https://img.nbc.com/sites/nbcunbc/files/files/styles/640x360/public/images/2017/6/27/ANW-Girl-ShowImage-1920x1080-KO.jpg?itok=ybBkBBrl&impolicy=nbc_com&imwidth=320","videoURL":"https://www.youtube.com/watch?v=jCUsHAgxPbc","description":"Several competitors try to accomplish difficult feats in order to win the coveted title.","__v":0,"tags":["reality"," fun"," adventure"],"favUserList":["1401498756564673","1128081597293753"]},{"_id":"5974c8fb0fb00e367e62edb0","name":"Blindspot","startTime":"10:00","endTime":"11:00","imageURL":"https://img.nbc.com/sites/nbcunbc/files/files/styles/640x360/public/images/2016/7/27/2016-0718-Blindspot-AboutImage-1920x1080-KO1.jpg?itok=wj2x8PEn&impolicy=nbc_com&imwidth=320","videoURL":"https://www.youtube.com/watch?v=biSRZM1NLDs","description":"When a strange woman finds herself in Times Square with absolutely no memory of her past and mysterious tattoos all over her body, she embarks on a journey to determine her identity.","__v":0,"tags":["thriller"," fantasy"," adventure"],"favUserList":["1401498756564673","1128081597293753"]}]);
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
					if(!likesList.includes(global.showsList[j].name) && (typeof global.showsList[j].favUserList != 'undefined') && !global.showsList[j].favUserList.includes(global.sId)){
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