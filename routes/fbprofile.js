var constants = require('../modules/constants');

var request = require('request');
var express = require('express');
var router = express.Router();
var graph = require('fbgraph');
var usersRouter = require('users');
var facebook = require('../modules/fbMessenger');

module.exports = function() {

	router.get('/oauthCallBack/', function(req, res) {

	    	var code=req.query['code'];
            global.senderIdFromOauth=req.query['senderId'];
	    	console.log(code);
	    	var redirect_uri=constants.FB_REDIRECT_URI+global.senderIdFromOauth;

	 
	    // after user click, auth `code` will be set 
	    // we'll send that and get the access token 
	    graph.authorize({
	        "client_id":      constants.FB_CLIENT_ID,
	    	"redirect_uri":   redirect_uri,
	       	"client_secret":  constants.FB_CLIENT_SECRET,
	        "code":           req.query.code
	   	 }, function (err, facebookRes) {
	   	 	    console.log(facebookRes)
	   	 	    console.log("-----------");
		    	var options = {
		        	    timeout:  3000,
		        	    pool:{ maxSockets:  Infinity }, 
		                headers:  { connection:  "keep-alive" }
		      		 };
		      	 var graphObject = graph
		     		 .setOptions(options)
		     		 .get("me?fields=id,name,timezone,birthday,location,locale,email,picture,gender,likes,books,movies", function(err, res) {
		     		     console.log("Personal id " + ":=" + global.senderIdFromOauth);
		     		     console.log("User data " + ":=" + res);
						console.log("Inserting the data into DB");
		     		     usersRouter.saveUserProfileData(global.senderIdFromOauth,res);

						facebook.sendWelcomeUser(global.senderIdFromOauth,res.name);

		     		     console.log(res); 




		   		 });  

		        graph.get("me/likes", {limit: 1000, access_token: graph.getAccessToken()}, function(err, res) {
		         	console.log("likes");
		        	 console.log(res); //res.name
		     	 });
		        graph.get("me/books", {limit: 1000, access_token: graph.getAccessToken()}, function(err, res) {
		         	console.log("books");
		        	 console.log(res);
		     	 });
		        graph.get("me/movies", {limit: 1000, access_token: graph.getAccessToken()}, function(err, res) {
		         	console.log("movies");
		        	 console.log(res);
		     	 });
		      		console.log("logged in");
	    });
 	 res.send("thanks");
     
	});
    

    router.get('/getAns', function(req, res) {
		dashboard.getAnswer(req,res);
	});

	router.get('/getQues', function(req, res, next) {
		
        dashboard.getQuestion(req,res);
            
        
	});
    
    router.get('/saveAns', function(req, res) {
		dashboard.saveAnswer(req,res);
	});

	router.get('/saveQues', function(req, res, next) {
		
        dashboard.saveQuestion(req,res);
            
       
	});
     return router;
}