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


	router.get('/sendTrailerLink', function(req, res) {

		var showId = req.query.showId;
		global.videoLink = req.query.videoLink;
		

    	getShowsListById(showId).then(function(response) {
            var promise = new Promise(function(resolve, reject) {
                console.log(response[0].favUserList.length);
                global.showUserResponse = response[0].favUserList;
                resolve(response[0]);    
            })
           return promise;
        }, function(error) {
                console.error(error);
        }).then(function(respo) {
            
           console.log(global.showUserResponse);
           for(var k = 0 ; k < global.showUserResponse.length ; k++)
			{
    			console.log(global.showUserResponse[k]);
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
			    facebook.sendTextMessage(global.showUserResponse[k],'Watch this video: '+ global.videoLink );
    			//facebook.sendVideoMessageWithData(messageData);
    			if(k == global.showUserResponse[k].length)
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

module.exports.getShowsList = getShowsList;



