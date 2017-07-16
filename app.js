var express = require('express');
var bodyParser = require('body-parser');
var constants = require('./modules/constants');
var fbMessenger = require('./modules/fbMessenger');



var mongoose = require('mongoose');
var config = require('./config');

var graph = require('fbgraph');

const request = require('request')

var app = express();

app.set('port', (process.env.PORT || 8080));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static('WebContent'));
global.__base = __dirname + '/';

//DB connection

// Connect to database
mongoose.connect(config.database.mlabs);

/* Router Declarations */
var facebook = require(__dirname + '/routes/facebook')();
var dashboard = require(__dirname + '/routes/dashboard')();
var shows = require(__dirname + '/routes/shows')();
var fbProfile= require(__dirname + '/routes/fbprofile')();
var users= require(__dirname + '/routes/users')();

/* Mapping the requests to routes (controllers) */
app.use('/facebook', facebook);
app.use('/dashboard', dashboard);
app.use('/shows', shows);
app.use('/fbProfile',fbProfile);
app.use('/users',users);


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
});


//Send push message
app.get('/sendPushMessages', function(req, res) {
	//Change dynamic 
	//var senderId = '1128081597293753';
    var senderId = req.query.senderId;
    var showsId = req.query.showsId;

    var msg = 'Thanks for liking the page. Do you want us to subscribe you for the show so that you can get show updates?';


    // Getting the show information

    var Shows = require(__base + 'models/shows');

	console.log("wait"+ senderId+showsId);


	// get all the users
	Shows.find({_id:showsId}, function(err, shows) {
		if (err) next(err);
		global.showsVar = shows[0];
		
	});

	
	fbMessenger.sendTextMessage(senderId,msg);
	

	console.log("Output debug 3:" + global.showsVar);
    var elements = [{
      title: global.showsVar.name,
      image_url: global.showsVar.imageURL,
      buttons: [{
        type: "postback",
        payload: "ADD_TO_FAVORITE_"+global.showsVar._id+"@"+senderId,
        title: "Add to Favorite"
      }]
    }];


    var messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: elements
        }
      }
    }
  };

  fbMessenger.sendGenericMessage(senderId,elements);

  res.sendStatus(200);

});




// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});
