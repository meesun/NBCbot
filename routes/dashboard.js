var dashboard = require('../modules/dashboard');
var request = require('request');
var express = require('express');
var q = require('q');
var router = express.Router();

module.exports = function() {
    
    router.get('/getAns', function(req, res) {
		dashboard.getAnswer(req,res);
	});
    //deprecated
	router.get('/getQues', function(req, res, next) {
		
        dashboard.getQuestionById(req,res);
            
        
	});
    //deprecated
    router.get('/saveAns', function(req, res) {
		dashboard.saveAnswer(req,res);
	});
    //deprecated
	router.get('/saveQues', function(req, res, next) {
		
        dashboard.saveQuestion(req,res);
	});
    //deprecated
    router.get('/getQnAnsByUser', function(req,res){
        dashboard.getQnAnsByUser(req,res);
    });
    
    router.get('/getShows', function(req,res){
        dashboard.getShows(req,res);
    });
    
     router.get('/getShowReviews', function(req,res){
        dashboard.getShowReviews(req,res);
    });
    
    router.get('/getShowDataByCountry', function(req,res){
        dashboard.getgeographicaldataByShow(req,res);
    });
    router.get('/getTagsfromReviews', function(req,res){
        dashboard.getTagsfromReviews(req,res);
    });
    router.get('/getAllQuestions', function(req,res){
        dashboard.getAllQuestions(req,res);
    });
    
    router.get('/getAgeDataByShow', function(req,res){
        dashboard.getAgeDataByShow(req,res);
    });
    
    
    
    return router;
}


/*
 * Get the generic list
 *
 */
function getFeedbackQuestionList(showName) {

	var Qnas = require(__base + 'models/qna');
	var deferred = q.defer();
	Qnas.find({show:showName,type:"feedback"}, function(err, qnas) {
		if (err) console.log(err);
		console.log(qnas);
		deferred.resolve(qnas);
	});
	return deferred.promise;
    
}



function setUserIdInQuestion(senderId,quesId){

	var Qnas = require(__base + 'models/qna');
      Qnas.findOneAndUpdate({_id:quesId},
       {$push: {"userId": senderId}},
       {safe: true, upsert: true, new : true}, 
       function (err, place) {
      });
}

module.exports.getFeedbackQuestionList=getFeedbackQuestionList;
module.exports.setUserIdInQuestion=setUserIdInQuestion;