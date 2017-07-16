var constants = require('./constants');
var request = require('request');
var graph = require('fbgraph');
var _ = require("underscore");
var users = require('../routes/users');

module.exports = {
  /*
   * Authorization Event
   *
   * The value for 'optin.ref' is defined in the entry point. For the "Send to
   * Messenger" plugin, it is the 'data-ref' field. Read more at
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
   *
   */


  
  receivedAuthentication: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
      "through param '%s' at %d", senderID, recipientID, passThroughParam,
      timeOfAuth);

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    sendTextMessage(senderID, "Authentication successful");
  },

  /*
   * Message Event
   *
   * This event is called when a message is sent to your page. The 'message'
   * object format can vary depending on the kind of message that was received.
   * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
   *
   * For this example, we're going to echo any text that we get. If we get some
   * special keywords ('button', 'generic', 'receipt'), then we'll send back
   * examples of those bubbles to illustrate the special message bubbles we've
   * created. If we receive a message with an attachment (image, video, audio),
   * then we'll simply confirm that we've received the attachment.
   *
   */

  sendWelcomeUser:function(senderID,name){

        sendTextMessage(senderID, constants.SEND_WELCOME_USER+name);
  },
 sendLikedShows: function(senderID,shows){
      if(shows.length>0){
      for (i = 0; i < shows.length; i++) {
            var show= shows[i];
            var elements=[];
            var showElement={
              title: show.name,
              subtitle:show.description,
              item_url:show.videoURL,
              image_url:show.imageURL,
               buttons: [{
               type: "postback",
               title: "Add to favorites",
               payload: "ADD_TO_FAVORITE_"+show._id,
              }],
            }
            elements.push(showElement);
        }
            sendGenericMessage(senderID,elements);

    } else{
        var quickReply = [{
         "content_type": "text",
          "title": "Explore",
          "payload": "EXPLORE"
         },
         {
         "content_type": "text",
         "title": "Trending Shows",
         "payload": "WHATS_HOT"
         }, {
         "content_type": "text",
         "title": "Game",
         "payload": "GAME"
      }];
       var text = "I can help you find new shows and play games";
       sendQuickReply(senderID,quickReply,text);
    }
 /*elements = [{
      title: "Game of Thrones",
      subtitle: "Valar Morghulis",
      item_url: "https://www.youtube.com/watch?v=zQJRVSaR_vY",
      image_url: "https://static.giantbomb.com/uploads/original/3/31685/2742670-game.jpg",
      buttons: [{
        type: "postback",
        title: "Add to favorites",
        payload: "ADD_TO_FAVORITE_1",
      }],
    }, {
      title: "Sherlock",
      subtitle: "The name is Sherlock and the address is 221B Baker's street",
      item_url: "https://www.youtube.com/watch?v=uzyKkKB7mT4",
      image_url: "https://www-tc.pbs.org/wgbh/masterpiece/wp-content/uploads/2017/01/mast-sherlock-s3-characters-sherlock-hires.jpg",
      buttons: [{
        type: "postback",
        title: "Add to favorites",
        payload: "ADD_TO_FAVORITE_2",
      }]
    }];*/
  },

  receivedMessage: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
      senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var isEcho = message.is_echo;
    var messageId = message.mid;
    var appId = message.app_id;
    var metadata = message.metadata;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;
    var quickReply = message.quick_reply;

    if (isEcho) {
      // Just logging message echoes to console
      console.log("Received echo for message %s and app %d with metadata %s",
        messageId, appId, metadata);
      return;
    } else if (quickReply) {
      var quickReplyPayload = quickReply.payload;
      console.log("Quick reply for message %s with payload %s", messageId, quickReplyPayload);
      this.resolveQuickReplyPayload(senderID,quickReply.payload)
      return;
    }

    if (typeof(messageText) == "string") {
      messageText = messageText.toUpperCase();
    } else {
      sendTextMessage(senderID, constants.KANNA_MESSAGES.UNKNOWN);
      return;
    }
    
    if (messageText) {

      // If we receive a text message, check to see if it matches any special
      // keywords and send back the corresponding example. Otherwise, just echo
      // the text we received.
      switch (messageText) {
        case "HI" || "HELLO" || "GOOD MORNING":
          sendTextMessage(senderID, "Welcome to NBC. I am here to help you :-)");
          break;
         case "OPTIONS" || "HELP":
            sendTextMessage(senderID, "Welcome to NBC. I am here to help you :-)");  
        case "NBC":
           sendFBLogin(senderID);
        case "PLAY":
           playGames(senderID,1);
        case 'IMAGE':
          sendImageMessage(senderID);
          break;
        case 'GIF':
          sendGifMessage(senderID);
          break;

        case 'AUDIO':
          sendAudioMessage(senderID);
          break;

        case 'VIDEO':
          sendVideoMessage(senderID);
          break;

        case 'FILE':
          sendFileMessage(senderID);
          break;

        case 'BUTTON':
          sendButtonMessage(senderID);
          break;

        case 'GENERIC':
          sendGenericMessage(senderID);
          break;

        case 'RECEIPT':
          sendReceiptMessage(senderID);
          break;

        case 'QUICK REPLY':
          sendQuickReply(senderID);
          break;

        case 'READ RECEIPT':
          sendReadReceipt(senderID);
          break;

        case 'TYPING ON':
          sendTypingOn(senderID);
          break;

        case 'TYPING OFF':
          sendTypingOff(senderID);
          break;

        case 'ACCOUNT LINKING':
          sendAccountLinking(senderID);
          break;

        default:
          sendTextMessage(senderID, constants.KANNA_MESSAGES.UNKNOWN);
      }
     
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Message with attachment received");
    }
  },


  /*
   * Delivery Confirmation Event
   *
   * This event is sent to confirm the delivery of a message. Read more about
   * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
   *
   */
  receivedDeliveryConfirmation: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var delivery = event.delivery;
    var messageIDs = delivery.mids;
    var watermark = delivery.watermark;
    var sequenceNumber = delivery.seq;

    if (messageIDs) {
      messageIDs.forEach(function(messageID) {
        console.log("Received delivery confirmation for message ID: %s",
          messageID);
      });
    }

    console.log("All message before %d were delivered.", watermark);
  },


  /*
   * Postback Event
   *
   * This event is called when a postback is tapped on a Structured Message.
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
   *
   */

  resolveQuickReplyPayload: function(senderID,payload){
     console.log("payload" + payload) ;
      if(payload.indexOf('EXPLORE') != -1){
        sendRecommendedShows(senderID)
      }
      else if(payload.indexOf('WHATS_HOT') != -1){
         sendTrendingShows(senderID)
       }
     else 
        sendTextMessage(senderID, "Postback called"+postback);

  },
  receivedPostback: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    console.log("Received postback for user %d and page %d with payload '%s' " +
      "at %d", senderID, recipientID, payload, timeOfPostback);
    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful

    var payload = event.postback.payload;
     
    console.log("payload" + payload) ;

    if (payload.indexOf('ADD_TO_FAVORITE') != -1) {
      


      //Commenting out to check the error
       //addToFavorite(payload,senderID);


       var quickReply = [{
         "content_type": "text",
          "title": "Explore",
          "payload": "EXPLORE"
         },
         {
         "content_type": "text",
         "title": "Trending Shows",
         "payload": "WHATS_HOT"
         }, {
         "content_type": "text",
         "title": "Game",
         "payload": "GAME"
      }];
       var text = "I can help you find new shows and play games";
       sendQuickReply(senderID,quickReply,text);

      /*var showId = payload.substring(payload.lastIndexOf('_')+1 , payload.lastIndexOf('@') );
      var userId = payload.substring(payload.lastIndexOf('@')+1 , payload.length);

      console.log(showId + ": = " + userId);
      var Shows = require(__base + 'models/shows');
      var Users = require(__base + 'models/users');
      Shows.find({_id:showId}, function(err, shows) {
        if (err) console.log(err);
        global._showDet = shows[0];
      });

      console.log("Show Details: " + global._showDet);

      Users.findOneAndUpdate({fbId:userId},
       {$push: {"favShows": global._showDet}},
       {safe: true, upsert: true, new : true}, 
       function (err, place) {
          sendTextMessage(senderID, "Added to the favorite");
      });
     */
    } else if(payload.indexOf('EXPLORE') != -1){
        sendRecommendedShows(senderID)
    }
    else if(payload.indexOf('WHATS_HOT') != -1){
        sendTrendingShows(senderID);

    }
    else 
      sendTextMessage(senderID, "Postback called"+postback);

  },

  /*
   * Message Read Event
   *
   * This event is called when a previously-sent message has been read.
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
   *
   */
  receivedMessageRead: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    // All messages before watermark (a timestamp) or sequence have been seen.
    var watermark = event.read.watermark;
    var sequenceNumber = event.read.seq;

    console.log("Received message read event for watermark %d and sequence " +
      "number %d", watermark, sequenceNumber);
  },

  /*
   * Account Link Event
   *
   * This event is called when the Link Account or UnLink Account action has been
   * tapped.
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
   *
   */
  receivedAccountLink: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;

    var status = event.account_linking.status;
    var authCode = event.account_linking.authorization_code;

    console.log("Received account link event with for user %d with status %s " +
      "and auth code %s ", senderID, status, authCode);
  }
}

/*
 * Send an image using the Send API.
 *
 */
function sendImageMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: constants.SERVER_URL + "/assets/rift.png"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Gif using the Send API.
 *
 */
function sendGifMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: constants.SERVER_URL + "/assets/instagram_logo.gif"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send audio using the Send API.
 *
 */
function sendAudioMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "audio",
        payload: {
          url: constants.SERVER_URL + "/assets/sample.mp3"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a video using the Send API.
 *
 */
function sendVideoMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: constants.SERVER_URL + "/assets/allofus480.mov"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a file using the Send API.
 *
 */
function sendFileMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "file",
        payload: {
          url: constants.SERVER_URL + "/assets/test.txt"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId, title, buttons) {
  /*if (!buttons) {
    buttons = [{
      type: "web_url",
      url: "https://www.oculus.com/en-us/rift/",
      title: "Open Web URL"
    }, {
      type: "postback",
      title: "Trigger Postback",
      payload: "DEVELOPER_DEFINED_PAYLOAD"
    }, {
      type: "phone_number",
      title: "Call Phone Number",
      payload: "+16505551234"
    }];
    title = "This is test text";
  }*/
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: title,
          buttons: buttons
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId, elements) {
  if (!elements) {
    elements = [{
      title: "rift",
      subtitle: "Next-generation virtual reality",
      item_url: "https://www.oculus.com/en-us/rift/",
      image_url: constants.SERVER_URL + "/assets/rift.png",
      buttons: [{
        type: "web_url",
        url: "https://www.oculus.com/en-us/rift/",
        title: "Open Web URL"
      }, {
        type: "postback",
        title: "Call Postback",
        payload: "Payload for first bubble",
      }],
    }, {
      title: "touch",
      subtitle: "Your Hands, Now in VR",
      item_url: "https://www.oculus.com/en-us/touch/",
      image_url: constants.SERVER_URL + "/assets/touch.png",
      buttons: [{
        type: "web_url",
        url: "https://www.oculus.com/en-us/touch/",
        title: "Open Web URL"
      }, {
        type: "postback",
        title: "Call Postback",
        payload: "Payload for second bubble",
      }]
    }];
  }

  var messageData = {
    recipient: {
      id: recipientId
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

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random() * 1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",
          timestamp: "1428444852",
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: constants.SERVER_URL + "/assets/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: constants.SERVER_URL + "/assets/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a message with Quick Reply buttons.
 *
 */
function sendQuickReply(recipientId, quickReply, text) {
  if (!quickReply) {
    quickReply = [{
      "content_type": "text",
      "title": "Action",
      "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
    }, {
      "content_type": "text",
      "title": "Comedy",
      "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
    }, {
      "content_type": "text",
      "title": "Drama",
      "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
    }];
    text = "What's your favorite movie genre?";
  }
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text,
      quick_replies: quickReply
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a read receipt to indicate the message has been read
 *
 */
function sendReadReceipt(recipientId) {
  console.log("Sending a read receipt to mark message as seen");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "mark_seen"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator on
 *
 */
function sendTypingOn(recipientId) {
  console.log("Turning typing indicator on");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };

  callSendAPI(messageData);
}

/*
 * Turn typing indicator off
 *
 */
function sendTypingOff(recipientId) {
  console.log("Turning typing indicator off");

  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

/*
 * Send a message with the account linking call-to-action
 *
 */
function sendAccountLinking(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Welcome. Link your account.",
          buttons: [{
            type: "account_link",
            url: constants.SERVER_URL + "/authorize"
          }]
        }
      }
    }
  };

  callSendAPI(messageData);
}
 

function playGames(senderID,quiz_id){

    if(global.user_games==null || global.user_games==undefined){
     var games=[{
        "_id":"222232",
        "question":"this is a test",
        "options":[":(",":D",":P"],
        "correct":":P",
        "showId":"1",
        "quiz_id":"1"
    },
    {
     "_id":"222234",
     "question":"this is a test",
      "options":["<3","<3"],
      "correct":":P",
      "showId":"2",
      "quiz_id":"1"
    }]


    global.user_games=[{"senderID":senderID,"games":games,"quiz_id":quiz_id}]
  }
      var user_games=_.where(global.user_games, {"senderID":senderID,"quiz_id":quiz_id});
      console.log(user_games);

      if(user_games!=undefined&& user_games.length==0 || user_games[0].games.length==0){
        //Fetch from DB and insert
             var games=[{
        "_id":"222232",
        "question":"this is a test",
        "options":[":(",":D",":P"],
        "correct":":P",
        "showId":"1",
        "quiz_id":"1"
    },
    {
     "_id":"222234",
     "question":"this is a test",
      "options":["<3","<3"],
      "correct":":P",
      "showId":"2",
      "quiz_id":"1"
    }]
        global.user_games=[{"senderID":senderID,"games":games,"quiz_id":quiz_id}]

        console.log("zero case");
      } 
          
          if(user_games!=undefined && user_games.length>0)
          {
             console.log("user_games"+user_games[0].games);
              var gameToBeSent=user_games[0].games[0]; 
              user_games[0].games.splice(0,1);
              

            _.each(global.user_games, function(item) {
               if (item.senderID === senderID && item.quiz_id==gameToBeSent.quiz_id ) 
                    item.games=user_games[0].games
            });

       var quickReply = [];
       for(var i=0;i<gameToBeSent.options.length;i++)
       {
              var reply={
                "content_type":"text",
                "title":gameToBeSent.options[i],
                "payload":"QUIZ_"+gameToBeSent.quiz_id+"_"+gameToBeSent.correct+"_"+gameToBeSent.options[i]+"_"+gameToBeSent.question
              }
              console.log(reply);
              quickReply.push(gameToBeSent);
        }
      
       var text = gameToBeSent.question;
       sendQuickReply(senderID,quickReply,text);
      } else{
            //calculate score
           var game_score= global.user_game_score;
           game_score=_.where(global.user_games, {"senderID":senderID,"quiz_id":quiz_id,"answer_right":true});
           sendTextMessage(constants.YOUR_SCORE_IS+game_score.length);
          }
      
    
  

}
/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  request({
    uri: constants.FB_MESSAGES_URL,
    qs: {
      access_token: constants.PAGE_ACCESS_TOKEN
    },
    method: 'POST',
    json: messageData

  }, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      if (messageId) {
        console.log("Successfully sent message with id %s to recipient %s",
          messageId, recipientId);
      } else {
        console.log("Successfully called Send API for recipient %s",
          recipientId);
      }
    } else {
      console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
    }
  });
}
  function sendFBLogin(senderID) {
    var redirect_uri=constants.FB_REDIRECT_URI+senderID;

    var authUrl = graph.getOauthUrl({
          "client_id":     constants.FB_CLIENT_ID,
          "redirect_uri":  redirect_uri
        });
   
          // shows dialog 
        console.log(authUrl);
        var buttons = [{
            type: "web_url",
            url: authUrl,
            title: "Login to FB",
            webview_height_ratio: "compact"
        }];
        var title = "Allow us to read your profile";

        sendButtonMessage(senderID, title, buttons);

}
   function addToFavorite(payload,senderId){

      var showId = payload.substring(payload.lastIndexOf('_')+1 , payload.length );
      global.addFavUserId = senderId;

      console.log(showId + ": = " + global.addFavUserId);
      var Shows = require(__base + 'models/shows');
      Shows.findOneAndUpdate({_id:showId},
       {$push: {"favUserList": senderId}},
       {safe: true, upsert: true, new : true}, 
       function (err, place) {
          sendTextMessage(global.addFavUserId, "Added to the favorite");
      });
   }

  
  function sendRecommendedShows(senderID){
 elements = [{
      title: "The Big Bang Theory",
      subtitle: "Knock Knock Knock, Penny",
      item_url: "https://www.youtube.com/watch?v=8xn-Rb0jejo",
      image_url: "https://upload.wikimedia.org/wikipedia/en/c/ce/The_Big_Bang_Theory_Cast.png",
      buttons: [{
        type: "postback",
        title: "Add to favorites",
        payload: "ADD_TO_FAVORITE_2",
      }]
    }];
      sendGenericMessage(senderID,elements);
  }
  function sendTrendingShows(senderID){
    // Get the content from DB and send a text message along with Generic Message
    console.log("sendTrendingShows");
    users.getGenericList(senderID).then(function(response) {
         console.log("final response");
         console.log(response);
         
         // Comment the below line and add the code to construct the list of fav - respons

         var elements = [];

        if(response.length>0){
        for (i = 0; i < response.length; i++) {
              var show= shows[i];
              var elements=[];
              var showElement={
                title: response.name,
                subtitle:response.description,
                item_url:response.videoURL,
                image_url:response.imageURL,
                 buttons: [{
                 type: "postback",
                 title: "Add to favorites",
                 payload: "ADD_TO_FAVORITE_"+response._id,
                }],
              }
              elements.push(showElement);
          }
              sendGenericMessage(senderID,elements);
        } 

     }, function(error) {
          console.error(error);
    });



      
  }

  function sendHelpMessage(senderID) {
    console.log('sendHelpMessage method called');
    var quickReply = [{
            "content_type": "text",
            "title": "Movies",
            "payload": constants.RECOMMEND_PAYLOAD
        },
        {
            "content_type": "text",
            "title": "Play",
            "payload": constants.PLAY_PAYLOAD
        },
        {
            "content_type": "text",
            "title": "Contact",
            "payload": constants.LOG_PAYLOAD
        }
    ];
    var title = "I'm Baasha.. Maaanik Baasha!! Kanna how can I help you? ";
    sendQuickReply(senderID, quickReply, title);
  }

module.exports.sendGenericMessage = sendGenericMessage;
module.exports.sendTextMessage = sendTextMessage;