
var userAns = require('../models/feedbackAns');
var userQn = require('../models/feedbackQn');
var emotional = require("emotional");
var shows = require('../models/shows');
var reviews = require('../models/reviews');
var q = require('q');
module.exports = {
    getQuestionById:function(req, res){
         userQn.find({_id: id}, function(err, data) {
            console.log(data[0].qn)
                         if(err==undefined)
                             {
                                 ques=data[0].qn;
                                 res.send(ques);
                             }
         });
    },
    getQnAnsByUser:function(req, res){
        var respArr=[];
                     userAns.find({userId: req.query.userId}, function(err, data) {
                        console.log(data)
                        if(err==undefined)
                        {
                            data.forEach(function(ans){
                                
                                userQn.find({_id: ans.qnId}, function(err, data) {
                                console.log(data[0].qn)
                                if(err==undefined)
                                {
                                    var ques=data[0].qn;
                                    var respObj={"question":ques, "answer":ans.answer};
                                    respArr.push(respObj);
                                }
                                });
                                
                                
                                
                            });
                            res.send(respArr);
                            
                        }
                        
            
        });
    },
    saveQuestion:function(req, res){

        console.log("saveQuestion hit");
                    userQnSchema = new userQn({
                        "qn": req.query.qn,
                        "qnOptions": req.query.options,
                        "type": req.query.type
                    });
        userQNSchema.save(function(err){
            console.log("question saved in db");
            res.sendStatus(200);
        });
        
    },
    saveAnswer:function(req, res){
        
                     userAnsSchema = new userAns({
                         "qnId": req.query.qnId,
                        "userId": req.query.userId,
                        "answer": req.query.answer
                    });
        userAnsSchema.save(function(err){
            console.log("question saved in db");
            res.sendStatus(200);
        });
    },
    
    getAnswer:function(req, res){
                     userAns.find({qnId: req.query.qnId, userId: req.query.userId}, function(err, data) {
                        if(err==undefined)
                             res.send(data[0].answer);
            
        });
    },
    
    getShows:function(req,res){
        shows.find({}, function(err, data) {
                        if(err==undefined)
                             res.send(data);
            
        });
    },
    
    getAllQuestions:function(req,res)
    {
        
    },
    getShowReviews:function(req,res){
       
        
        reviews.find({},function(err,data){
             var reviewMap=new Object();
            console.log(data);
            var promises=[];
            for(var i=0;i<data.length;i++){
                     
                var show=data[i].show;
                var reviewCount = reviewMap[show];
                var reviewobj=new Object();
                if(reviewCount==undefined)
                {
                    var reviewCount = new Object();
                    reviewCount.positive=0;
                    reviewCount.negative=0;
                    reviewMap[show]=reviewCount;
                }
                var promise=getSentiment(data[i].review,reviewMap[show]);
                promises.push(promise);
             
                console.log(reviewMap);
            }
            q.all(promises).then(function(data){res.send(reviewMap)});
        });

    }
}
    
    



function getSentiment(review,obj)
{
    var defer = q.defer();
    emotional.load(function () {
                    
                    var positive = emotional.positive(review);
                    if(positive)
                    {
                        obj.positive++;
                    }
                    else{
                        obj.negative++;
                    } 
                    defer.resolve(positive);
                });
    return defer.promise;
}


