
var userAns = require('../models/feedbackAns');
var userQn = require('../models/feedbackQn');
var emotional = require("emotional");
var shows = require('../models/shows');
var reviews = require('../models/reviews');
var q = require('q');
var NodeGeocoder = require('node-geocoder');
var users = require('../models/users');
var watson = require('watson-developer-cloud');
var qna = require('../models/qna');
module.exports = {
    
    //deprecated
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
    //deprecated
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
    //deprecated
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
    //deprecated
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
    //deprecated
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
             var reviewMap = new Object();
            console.log(data);
            var promises = [];
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

    },
    
    
    
    getgeographicaldataByShow: function(req,res)
    {
        users.find({},function(err,data){
            var countryMap = new Object();
            var promises = [];
            for(var i=0;i<data.length;i++){
                 var location = data[i].location;
                var country=location.split(",")[1].trim();
                if(country)
                    {
                        if(countryMap[country])
                            {
                                 countryMap[country]++;
                            }
                       else{
                           countryMap[country]=1;
                       }
                    }
            }
            res.send(countryMap);
        });
    },
    getTagsfromReviews:function(req,res)
    {
        var alchemy_language = watson.alchemy_language({
          api_key: 'API_KEY'
        })

        var parameters = {
          text: 'http://news.ycombinator.com'
        };

        alchemy_language.feeds(parameters, function (err, response) {
          if (err)
            console.log('error:', err);
          else
            console.log(JSON.stringify(response, null, 2));
        });
    },
    
    saveShows:function(req,res)
    {
        var shows= new shows({
            name: req.query.name,
            startTime: req.query.startTime,
            endTime: req.query.endTime,
            imageURL: req.query.imageURL,
            videoURL: req.query.videoURL,
            favUserList: req.query.favUserList,
            description: req.query.description.
        });
        shows.save(function(err){
            if(err==undefined)
                {
                    console.log("show ")
                    res.sendStatus(200);
                }
            
        })
        
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





