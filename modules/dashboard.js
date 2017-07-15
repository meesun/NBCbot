
var feedbackAns = require(__base + 'models/feedbackAns');
var feedbackQn = require(__base + 'models/feedbackQn');

module.exports = {
    getQuestion:function(req,res){
                    var feedbackQn.find({_id:"1"}, function(err, movies) {
            console.log(feedbackQn.qn)
            
        });
    },
    saveQuestion:function(req,res){
                    var feedbackQnSchema = new feedbackQn({
                        "qn": req.query.qn,
                        "qnOptions": req.query.options
                    });
        feedbackQn.save(function(err){
            consiole.log("question saved in db")
        });
    },
    saveAns:function(req,res){
        
                    var feedbackAnsSchema = new feedbackAns({
                         "qnId": req.query.qnId,
                        "userId": req.query.userId,
                        "answer": req.query.answer
                    });
        feedbackAns.save(function(err){
            consiole.log("question saved in db")
        });
    },
    
    getAns:function(req,res){
                    var feedbackAns.find({_id : req.query.qnId , userId : req.query.userId}, function(err, movies) {
            console.log(feedbackAns.answer);
            
        });
    }

}