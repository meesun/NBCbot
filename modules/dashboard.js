
var feedbackAns = require('../models/feedbackAns');
var feedbackQn = require('../models/feedbackQn');

module.exports = {
    getQuestion:function(req,res){
                     feedbackQn.find({_id:"1"}, function(err, movies) {
            console.log(feedbackQn.qn)
            
        });
    },
    saveQuestion:function(req,res){
                    feedbackQnSchema = new feedbackQn({
                        "qn": req.query.qn,
                        "qnOptions": req.query.options
                    });
        feedbackQn.save(function(err){
            consiole.log("question saved in db")
        });
    },
    saveAnswer:function(req,res){
        
                     feedbackAnsSchema = new feedbackAns({
                         "qnId": req.query.qnId,
                        "userId": req.query.userId,
                        "answer": req.query.answer
                    });
        feedbackAns.save(function(err){
            consiole.log("question saved in db")
        });
    },
    
    getAnswer:function(req,res){
                     feedbackAns.find({_id : req.query.qnId , userId : req.query.userId}, function(err, movies) {
            console.log(feedbackAns.answer);
            
        });
    }

}