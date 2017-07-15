var express = require('express');
var bodyParser = require('body-parser');
var constants = require('./modules/constants');
var fbMessenger = require('./modules/fbMessenger');
var graph = require('fbgraph');

const request = require('request')

var app = express();

app.set('port', (process.env.PORT || 8080));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static('WebContent'));

/* Router Declarations */
var facebook = require(__dirname + '/routes/facebook')();
var dashboard = require(__dirname + '/routes/dashboard')();
/* Mapping the requests to routes (controllers) */
app.use('/facebook', facebook);
app.use('/dashboard', dashboard);

app.get('/', function (req, res) {
    res.send('hello world');
});

app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === 'poda dai') {
        res.send(req.query['hub.challenge']);
        return;
    }
    res.send('Error, wrong token');
});

app.get('/oauthCallBack/', function(req, res) {
    
    var code=req.query['code'];
    console.log(code);

    var params= 'client_id=1478594992183399&redirect_uri=https://nbcbot.herokuapp.com/oauthCallBack&client_secret=71c05fdcbb94af65d4def71056e0def6&code='+code;
    if(code!=null){
    request({
           url: " https://graph.facebook.com/v2.9/oauth/access_token?"+params,
            headers: {
             'Content-Type': 'application/x-www-form-urlencoded'
            },
           method: "GET",
          // <--Very important!!!
        }, function (error, response, body){

           console.log("inside body");
           console.log(body);
           var access_token=body['access_token'];
           var graph = require('fbgraph');
           graph.setAccessToken(access_token);
           graph.get('likes', {limit: 1000, access_token: access_token}, function(err, res) {
                console.log(res);
          });
        });
    } 
    res.send("code");
    
});

app.get('/clientCallBack/', function(req, res) {
    console.log(req);
    res.send("code");
    
});



app.post('/webhook/', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    fbMessenger.receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    fbMessenger.receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    fbMessenger.receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    fbMessenger.receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    fbMessenger.receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    fbMessenger.receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
})



// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});
