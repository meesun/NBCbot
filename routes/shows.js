var express = require('express');
var request = require('request');
var q = require('q');
var router = express.Router();
var facebook = require('../modules/fbMessenger');

module.exports = function() {

	router.get('/', function(req, res) {
		res.send('Shows Home');
	});

	

	router.get('/getShows', function(req, res) {
		var Shows = require(__base + 'models/shows');
			Shows.find({}, function(err, shows) {
				if (err) console.log(err);
				res.json(shows);
		});
	});

	//Get favorite shows - most favorite
	router.get('/getMostFavoriteShows', function(req, res) {
		getShowsList().then(function(response) {
                global.showResponse = response;
                var temp = 0;        
                var mostFavShow = "";        
                for(var m = 0; m < global.showResponse.length; m++){
                    if( temp < global.showResponse[m].favUserList.length){
                        temp = global.showResponse[m].favUserList.length;
                        mostFavShow = global.showResponse[m];
                    }
                }
                console.log(mostFavShow);
                console.log(mostFavShow);
                res.send(mostFavShow);  
                
            })
	});

	
	router.get('/sendTrailerLink', function(req, res) {

		var showId = req.query.showId;
		global.videoLink = req.query.videoLink;
		

    	getShowsListByIdWithName(showId).then(function(response) {
            var promise = new Promise(function(resolve, reject) {
                console.log(response[0].favUserList.length);
                global.showUserResponse = response[0];
                resolve(response[0]);    
            })
           return promise;
        }, function(error) {
                console.error(error);
        }).then(function(respo) {
            
           console.log(global.showUserResponse);
           for(var k = 0 ; k < global.showUserResponse.favUserList.length ; k++)
			{
				console.log(global.showUserResponse);
    			// var messageData = {
			    //   recipient: {
			    //     id: global.showUserResponse[k]
			    //   },
			    //   message: {
			    //     attachment: {
			    //       type: "video",
			    //       payload: {
			    //         url: global.videoLink 
			    //       }
			    //     }
			    //   }
			    // }
			    // console.log(messageData);
			    facebook.sendTextMessage(global.showUserResponse.favUserList[k],global.showUserResponse.name+' is about to start. Click on the link to watch the trailer ! ' + global.videoLink );
    			//facebook.sendVideoMessageWithData(messageData);
    			if(k == global.showUserResponse.favUserList[k].length)
    			{
    				console.log('finalResp');
    				var finalResp = {"status": "success"};
    				respo.json(finalResp); 
    				res.sendStatus(200);
    			}
		   }
            
        }, function(error) {
                console.error(error);
        })

        res.sendStatus(200);
	});


	return router;
}


/*
 * Get the generic list
 *
 */
function getShowsList() {

	var Shows = require(__base + 'models/shows');
	var deferred = q.defer();

	Shows.find({}, function(err, shows) {
		if (err) console.log(err);
		
				deferred.resolve(shows);
	});
	return deferred.promise;
    
}


/*
 * Get the show list for a list of users
 *
 */
function getShowsListById(showId) {

	var Shows = require(__base + 'models/shows');
	var deferred = q.defer();

	Shows.find({_id:showId},{'favUserList':1}, function(err, shows) {
		if (err) console.log(err);
			deferred.resolve(shows);
	});
	return deferred.promise;
    
}


/*
 * Get the show list for a list of users
 *
 */
function getShowsListByIdWithName(showId) {

	var Shows = require(__base + 'models/shows');
	var deferred = q.defer();

	Shows.find({_id:showId}, function(err, shows) {
		if (err) console.log(err);
			deferred.resolve(shows);
	});
	return deferred.promise;
    
}

module.exports.getShowsList = getShowsList;



