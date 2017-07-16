
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
var lookup = require('country-data').lookup;
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

    getAnswer:function(req, res){
        var ansArr=[];
         qna.find({qn: req.query.qn},{answer:1,'_id':0}, function(err, data) {
            if(err==undefined)
                {
                    for(var i=0;i<data.length;i++)
                    {
                        ansArr.push(data[i].answer)
                    }
                 res.send(ansArr);

                }

        });
    },

    getShows:function(req,res){
        shows.find({}, function(err, data) {
                        if(err==undefined)
                             res.send(data);

        });
    },

    getQuizQuestions:function(req,res){
        qna.find({type:'quiz'}, function(err,data){
                 if(err==undefined)
                    res.send(data);
                 });
    },

    getAllQuestions:function(req,res)
    {
        qna.find({type:'feedback'},{'qn':1,'_id':0},function(err,data){
            var ques=[];
            for(var i=0;i<data.length;i++)
                {
                    ques.push(data[i].qn)
                }
            res.send(ques);
        });
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

    getAgeDataByShow: function(req,res)
    {
        users.find({},function(err,data){
            var ageMap = new Object();
            for(var i=0;i<data.length;i++){
                 var birthday = data[i].birthday;
                var age=getAge(birthday);
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
                        var code=lookup.countries({name: country})[0].alpha2;
                        console.log(code);
                        if(countryMap[code])
                            {
                                 countryMap[code]++;
                            }
                       else{
                           countryMap[code]=1;
                       }
                    }
            }
            res.send(countryMap);
        });
    },
    getTagsfromReviews:function(req,res)
    {
        var tagArr=new Object();
        var promises=[];
        qna.find({type:'feedback'},{'response.response':1,'_id':0},function(err,data){
            if(err)
                res.send(err);
            else{
                for(var i=0;i<data.length;i++)
                {
                    var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
                    var natural_language_understanding = new NaturalLanguageUnderstandingV1({
                      "username": "a3b43ba0-0ea4-4de6-8993-05f9bb7e3cae",
                      "password": "jjjfrpQooMyw",
                      'version_date': '2017-02-27'
                    });

                    var parameters = {
                      'text': data[i].response[0].response,
                      'features': {
                        'keywords': {
                          'sentiment': true,
                          'emotion': true,
                          'limit': 3
                        }
                      }
                    };
                    var promise=getTags(natural_language_understanding,parameters,tagArr);
                    promises.push(promise);
                }
                q.all(promises).then(function(data){res.send(tagArr)});
            }
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
            description: req.query.description,
            tags:req.query.tags
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


function getTags(nlu,parameters,obj)
{
    var defer = q.defer();
    nlu.analyze(parameters, function(err, response) {
                      if (err)
                        console.log('error:', err);
                      else
                        var tagRes=response;
        console.log("22");
        console.log(tagRes)
                        var keywordsArr = tagRes.keywords;
                        for(var i=0;i<keywordsArr.length;i++)
                            {
                                if(obj[keywordsArr[i].text])
                                    {
                                        obj[keywordsArr[i].text]++;
                                    }
                                else{
                                       obj[keywordsArr[i].text]=1;

                                }
                            }
                        defer.resolve(obj);
                    });
    return defer.promise;
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

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
