var constants = require('./constants');
var request = require('request');
var graph = require('fbgraph');
var _ = require("underscore");
var users = require('../routes/users');
var q = require('q');

module.exports = {
  /*
   * Authorization Event
   *
   * The value for 'optin.ref' is defined in the entry point. For the "Send to
   * Messenger" plugin, it is the 'data-ref' field. Read more at
   * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
   *
   */

  updateQuizAnswer:function(payload,senderID){
     var res = payload.split("_");
     var valid=false;
     if(res[2]==res[3]){
        valid=true;
        console.log("eq")

     }

     console.log(valid)

     var score={
      "senderID":senderID,
      "show":res[1],
      "answer_right":valid,
      "question":res[4],
      "answer":res[2]
     }

    var game_score= global.user_game_score;
    if(game_score==null || game_score==undefined){
      var game_score_array=[];
      game_score_array.push(score);
      global.user_game_score=game_score_array;
    } else{
            global.user_game_score.push(score);
    }
    console.log(res[0]+"......"+res[1]+"......"+res[2]+"......"+res[3]+"...."+res[4]);
    playGames(senderID,''+res[1])
  },

  
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
      console.log('----Sending Liked shows-----');
      console.log(shows);
      if(shows.length>0){
        var elements=[];
      for (i = 0; i < shows.length; i++) {
           console.log("show---"+i)
            var show= shows[i];
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
            console.log(elements);
        }
            sendTextMessage(senderID,"Here's a list of shows based on your facebook likes. Click add to favourites to get more updates on the shows")
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
  
  checkLogin:function(senderId){
      console.log("here")    
      var UsersModel = require(__base + 'models/users');

      UsersModel.find({fbId:senderId}, function(err, user) {
          if(user.length>0){
              users.getFavoriteList(senderId).then(function(response) {
                  console.log("final response---- FavoriteList");
                   console.log(response);
                   console.log("----Send liked shows");
                   sendfavShows(senderId,response);
               }, function(error) {
                    console.log(error);
                    console.error(error);
              });
          }
          else{
            sendFBLogin(senderId)
          }
      });
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
    console.log(messageText)
    
    if(messageText.includes('PROMO')){
       console.log('includes')
       var showName= messageText.substring(0, messageText.indexOf('PROMO')-1);
       console.log(showName)

       var regex = new RegExp(["^", showName, "$"].join(""), "i");

       var shows = require(__base + 'models/shows');
       console.log(regex)
        shows.find({ "name": regex},function(err,data){
              sendTextMessage(senderID,'Promo: '+data[0].videoURL)
        }); 
    }
    else if(messageText.includes('WHEN')||messageText.includes('TIME')){
       var showName= messageText.substring(messageText.indexOf('EPISODE OF')+11, messageText.length);
        var regex = new RegExp(["^", showName, "$"].join(""), "i");

       var shows = require(__base + 'models/shows');
       console.log(regex);
        shows.find({ "name": regex},function(err,data){
              console.log(data[0].airDay)
              var text=''
              if(data[0].airDay!=undefined){
                text=data[0].airDay+' at: '+data[0].startTime;
              } else {
                text=' At: '+data[0].startTime;
              }
              sendTextMessage(senderID, data[0].airDay+' at: '+data[0].startTime)
        }); 

    }
    else if (messageText) {

      // If we receive a text message, check to see if it matches any special
      // keywords and send back the corresponding example. Otherwise, just echo
      // the text we received.
      switch (messageText) {
        case "HI" || "HELLO" || "GOOD MORNING":
          sendTextMessage(senderID, "Welcome to NBC. I am here to help you :-)");
          this.checkLogin(senderID);
          break;
         case "OPTIONS" || "HELP":
            sendTextMessage(senderID, "Welcome to NBC. I am here to help you :-)");
          this.checkLogin(senderID);  
          break;
        case "WHEN IS THE NEXT EPISODE OF JUDGE CUTS":
            sendTextMessage(senderID, "Tuesday, JUL 25. Would you like me to remind you?");  
          break;
        case "YES":
            sendTextMessage(senderID, "Got it! I will send in a reminder.");  
          break;
        case "MIDNIGHT TEXAS PROMO":
            sendTextMessage(senderID, "https://www.youtube.com/watch?v=rSjtrj-zFgo");  
          break;
        case "NBC":
           sendFBLogin(senderID);
           break;
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
     else if(payload.includes('QUIZ')){
        this.updateQuizAnswer(payload,senderID);
     }
     else if(payload.includes('GAME')){
                 findGames(senderID);
                 // playGames(senderID,'1');
     }
     else if(payload.includes('SHOW')){
          var payloadSplitArr = payload.split('_');
          playGames(senderID,payloadSplitArr[1]);
     }
     else if(payload.includes('OPTION_PAYLOAD')){
        console.log('OPTION_PAYLOAD');
        var payloadSplitArr = payload.split('_');
        console.log(payloadSplitArr);
        var questionID = payloadSplitArr[2];
        var ansswerID = payloadSplitArr[4];
        insertReplyIntoDB(senderID, questionID, ansswerID);
     }
        

  },
  receivedPostback: function(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = event.postback.payload;

    global.finalUserId = senderID;
    console.log("Received postback for user %d and page %d with payload '%s' " +
      "at %d", senderID, recipientID, payload, timeOfPostback);
    // When a postback is called, we'll send a message back to the sender to
    // let them know it was successful

    var payload = event.postback.payload;
     
    console.log("payload" + payload) ;

    if (payload.indexOf('ADD_TO_FAVORITE') != -1) {
      addToFavorite(payload,global.finalUserId).then(function(response) {
                console.log('console test - NBC');
                
      })

      //Commenting out to check the error
       //addToFavorite(payload,senderID);  

    } else if(payload.indexOf('EXPLORE') != -1){
        sendRecommendedShows(senderID)
    }
    else if(payload.indexOf('WHATS_HOT') != -1){
        sendTrendingShows(senderID);
    }
    else if(payload.indexOf('OPTION_PAYLOAD_') != -1){
        console.log('OPTION_PAYLOAD');
        var payloadSplitArr = payload.split('_');
        console.log(payloadSplitArr);
        var questionID = payloadSplitArr[1];
        var ansswerID = payloadSplitArr[2];
        insertReplyIntoDB(senderID, questionID, ansswerID);
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
 * Send a video using the Send API.
 *
 */
function sendVideoMessageWithData(messageData) {
  console.log('Sap');
  if(!messageData){
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
    }
  }

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
  console.log("send Quick Reply");
  console.log(recipientId);
  console.log(quickReply);
  console.log(text);

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
 
function findGames(senderID){
      var Qnas = require(__base + 'models/qna');

      Qnas.find({type:"quiz"}).distinct("show",function(err,data){
        var quickReply=[];
        console.log(data);
        for(var i=0;i<data.length;i++){
             var reply={
                "content_type":"text",
                "title":data[i],
                "payload":"SHOW_"+data[i]
              }
              console.log(reply);
              quickReply.push(reply);
        }
        var txt="you can play one of these"
        sendQuickReply(senderID,quickReply,txt)
      })
}
function playGames(senderID,showid){
    var Qnas = require(__base + 'models/qna');
    console.log(senderID);
    console.log(showid);
    console.log("********");

    if(global.user_games==null || global.user_games==undefined){            
            Qnas.find({type:"quiz",show:showid},function(err,data){
                    global.user_games=[{"senderID":senderID,"games":data,"show":showid}]
                    gamePlay(senderID,showid)
            })
      }  else{

            var user_games=_.where(global.user_games, {"senderID":senderID,"show":showid});
            if(user_games.length==0){
                Qnas.find({type:"quiz",show:showid},function(err,data){
                      global.user_games=[{"senderID":senderID,"games":data,"show":showid}]
                      gamePlay(senderID,showid)
                })
            }
             else {
               gamePlay(senderID,showid)
             }
            
      }
}

function gamePlay(senderID,showid){
  console.log("gamePlay");
      console.log(global.user_games);

      var user_games=_.where(global.user_games, {"senderID":senderID,"show":showid});
      console.log("user games");
      console.log(user_games);
      console.log("-----------");
      if(user_games!=undefined && user_games.length==0 || user_games[0].games.length==0){
        var game_score= global.user_game_score;
           game_score=_.where(global.user_game_score, {"senderID":senderID,"show":showid,"answer_right":true});
           sendTextMessage(senderID,constants.YOUR_SCORE_IS+game_score.length);
            var wrong=_.where(global.user_game_score, {"senderID":senderID,"show":showid,"answer_right":false});
                console.log("Wrong");
                console.log(wrong);
                if(wrong.length>0){
                  var wrong_answer_list='';
                 for(var i=0;i<wrong.length;i++)
                    {
                      var wrong_answer="question: "+wrong[i].question+" Answer: "+wrong[i].answer+'\n';
                      wrong_answer_list=wrong_answer_list+wrong_answer;
                    }
                    sendTextMessage(senderID,'You went wrong in: -'+wrong_answer_list);

                }
            console.log("zero case");
      } 
          
      else  if(user_games!=undefined && user_games.length>0)
          {
             console.log("user_games"+user_games[0].games);
              var gameToBeSent=user_games[0].games[0]; 
              user_games[0].games.splice(0,1);
              

            _.each(global.user_games, function(item) {
               if (item.senderID === senderID && item.showid==gameToBeSent.showid ) {
                    item.games=user_games[0].games;
                    console.log("removing");
                    console.log(item)
                  }

                  console.log("--------");
                  console.log(global.user_games)
            });

       var quickReply = [];
       for(var i=0;i<gameToBeSent.options.length;i++)
       {
              var reply={
                "content_type":"text",
                "title":gameToBeSent.options[i],
                "payload":"QUIZ_"+gameToBeSent.show+"_"+gameToBeSent.answer+"_"+gameToBeSent.options[i]+"_"+gameToBeSent.qn
              }
              console.log(reply);
              quickReply.push(reply);
        }
      
       var text = gameToBeSent.qn;
       sendQuickReply(senderID,quickReply,text);
      } else{
            //calculate score
           var game_score= global.user_game_score;
           game_score=_.where(global.user_game_score, {"senderID":senderID,"show":showid,"answer_right":true});
           sendTextMessage(senderID,constants.YOUR_SCORE_IS+game_score.length);

           var wrong=_.where(global.user_game_score, {"senderID":senderID,"show":showid,"answer_right":false});
                console.log("Wrong");
                console.log(wrong);
                if(wrong.length>0){
                  var wrong_answer_list='';
                 for(var i=0;i<wrong.length;i++)
                    {
                      var wrong_answer="question: "+wrong[i].question+"Answer: "+wrong[i].answer+'\n';
                      wrong_answer_list=wrong_answer_list+wrong_answer;
                    }
                    sendTextMessage(senderID,'You Went Wrong in-');
                    sendTextMessage(senderID,wrong_answer_list);

                }
          }
      
    
  
}
/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
function callSendAPI(messageData) {
  console.log(messageData)
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
        var title = "To get started allow us to read your profile";

        sendTextMessage(senderID, constants.WELCOME_MSG);
        sendButtonMessage(senderID, title, buttons);

}
   function addToFavorite(payload,senderId){

      var deferred = q.defer(); 
      var showId = payload.substring(payload.lastIndexOf('_')+1 , payload.length );
      global.addFavUserId = senderId;

      console.log(showId + ": = " + global.addFavUserId);
      var Shows = require(__base + 'models/shows');
      Shows.findOneAndUpdate({_id:showId},
       {$push: {"favUserList": senderId}},
       {safe: true, upsert: true, new : true}, 
       function (err, place) {
        
          sendTextMessage(global.addFavUserId, "Added to the favorites. We'll keep you posted on this show");
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
          sendQuickReply(global.addFavUserId,quickReply,text);
          deferred.resolve(quickReply);
      });
      return deferred.promise;
   }

  
  function sendRecommendedShows(senderID){
          findShows(senderID);
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
          console.log("looping through")

        for (i = 0; i < response.length; i++) {
              var show= response[i];
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



  function insertReplyIntoDB(senderID, questionID, answerID){
    var Shows = require(__base + 'models/shows');
    var Qnas = require(__base + 'models/qna');
    var ansUser = {
      userId: senderID,
      response: answerID
    }
    console.log(ansUser);

    console.log(questionID);

    global.sendMsg = senderID;

    Qnas.findOneAndUpdate({_id:questionID},
     {$push: {"response": ansUser}},
     {safe: true, upsert: true, new : true}, 
     function (err, place) {
        sendTextMessage(global.sendMsg, "Noted :)");
    });
  }
  



  function findShows(senderID){
    console.log("FINDINGS SHOWS")
    var shows = require(__base + 'models/shows');
    shows.distinct("tags", { "favUserList": senderID},function(err,data){
      console.log("callback")
      console.log(data)
      shows.find({"tags":{"$in":data},"favUserList":{"$ne":senderID}},function(err,data){
              console.log("recommendedShows");
              console.log(data);
              var elements=[];
        if(data.length>0){
              for (i = 0; i < data.length; i++) {
              var show= data[i];
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
            }   console.log(elements)
                sendGenericMessage(senderID,elements);

        }
      });
     
    })



  }

 function sendfavShows(senderID,shows){
      console.log('----Sending Liked shows-----');
      console.log(shows);
      if(shows.length>0){
        var elements=[];
      for (i = 0; i < shows.length; i++) {
           console.log("show---"+i)
            var show= shows[i];
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
            console.log(elements);
        }
            sendTextMessage(senderID,"Here's a list of shows based on your facebook likes. Click add to favourites to get more updates on the shows")
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
}
module.exports.sendGenericMessage = sendGenericMessage;
module.exports.sendTextMessage = sendTextMessage;
module.exports.sendButtonMessage = sendButtonMessage;
module.exports.sendQuickReply = sendQuickReply;
module.exports.sendVideoMessageWithData = sendVideoMessageWithData;
module.exports.sendFBLogin = sendFBLogin;
