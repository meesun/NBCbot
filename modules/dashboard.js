
var userAns = require('../models/feedbackAns');
var userQn = require('../models/feedbackQn');
var emotional = require("emotional");

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
    
    getshows:function(req,res){
        
    }
    
    
}


