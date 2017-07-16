var constans = require('../modules/constants');

var request = require('request');
var express = require('express');
var router = express.Router();
var graph = require('fbgraph');

module.exports = function() {

	router.get('/oauthCallBack/', function(req, res) {

	    	var code=req.query['code'];
	    	console.log(code);
	    	var authUrl = graph.getOauthUrl({
	        "client_id":     constants.CLIENT_ID,
	        "redirect_uri":  constants.CLIENT_SECRET
	  	  });
	 
	  		  // shows dialog 
	      console.log(authUrl);
	 
	    // after user click, auth `code` will be set 
	    // we'll send that and get the access token 
	    graph.authorize({
	        "client_id":      constants.CLIENT_ID
	      , "redirect_uri":   constants.CLIENT_SECRET
	      , "client_secret":  constants.redirect_uri
	      , "code":           req.query.code
	   	 }, function (err, facebookRes) {
		    	var options = {
		        	    timeout:  3000,
		        	    pool:{ maxSockets:  Infinity }, 
		                headers:  { connection:  "keep-alive" }
		      		 };
		      	 var graphObject = graph
		     		 .setOptions(options)
		     		 .get("me?fields=id,name,timezone,birthday,location,locale,email,picture", function(err, res) {
		     		     console.log("here");
		     		     console.log(res); 
		   		 });  

		        graph.get("me/likes", {limit: 1000, access_token: token}, function(err, res) {
		         	console.log("likes");
		        	 console.log(res);
		     	 });
		      		console.log("logged in");
	    });
    	/*var params= 'client_id='+constants.CLIENT_ID+'&redirect_uri='+constant.FBREDIRECT_URI+'&client_secret='+constants.CLIENT_SECRET'&code='+code;
   		if(code!=null){
        	request({
       		  url: "https://graph.facebook.com/v2.9/oauth/access_token?"+params,
       		  headers: {
        	   'Content-Type': 'application/x-www-form-urlencoded'
      		 },
      		 method: "GET",
  			 }, function (error, response, body){

     		console.log("inside body");
   			console.log(body);
     		var tokenJson=JSON.parse(body);
     		var token=tokenJson.access_token;
    		console.log("obtained"+token);
     		if(token!=null){
    		    console.log(token);
    		    var options = {
        	    timeout:  3000,
        	    pool:{ maxSockets:  Infinity }, 
                headers:  { connection:  "keep-alive" }
      		 };
      
    	   graph.setAccessToken(token)
		   var graphObject = graph
     		 .setOptions(options)
     		 .get("me/?fields=id,name,timezone,birthday,location,locale,email,picture", function(err, res) {
     		     console.log("here");
     		     console.log(res); 
   		 });  

        graph.get("me/likes", {limit: 1000, access_token: token}, function(err, res) {
         console.log("likes");
         console.log(res);
      });
    } */

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