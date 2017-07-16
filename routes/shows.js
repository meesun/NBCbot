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
