var express = require('express');
var request = require('request');
var router = express.Router();

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



	return router;
}


/*
 * Get the generic list
 *
 */
function getShowsList() {
    console.log("Getting the favorite show for the user: " + senderId );

	var Shows = require(__base + 'models/shows');
	var deferred = q.defer();

	Shows.find({}, function(err, shows) {
		if (err) console.log(err);
		
				deferred.resolve(shows);
	});
	return deferred.promise;
    
}

module.exports.getShowsList = getShowsList;
