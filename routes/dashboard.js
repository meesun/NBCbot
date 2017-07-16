var dashboard = require('../modules/dashboard');
var request = require('request');
var express = require('express');
var router = express.Router();

module.exports = function() {
    router.get('/getAns', function(req, res) {
		dashboard.getAnswer(req,res);
	});

	router.get('/getQues', function(req, res, next) {
		
        dashboard.getQuestionById(req,res);
            
        
	});
    
    router.get('/saveAns', function(req, res) {
		dashboard.saveAnswer(req,res);
	});

	router.get('/saveQues', function(req, res, next) {
		
        dashboard.saveQuestion(req,res);
	});
    
    router.get('/getQnAnsByUser', function(req,res){
        dashboard.getQnAnsByUser(req,res);
    });
    
    router.get('/getShows', function(req,res){
        dashboard.getShows(req,res);
    });
    
     router.get('/getShowReviews', function(req,res){
        dashboard.getShowReviews(req,res);
    });
    
     return router;
}