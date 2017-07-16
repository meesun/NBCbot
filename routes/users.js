var express = require('express');
var request = require('request');
var router = express.Router();

module.exports = function() {


	router.get('/sendPushMessage', function(req, res) {
    	var result='Say Kevin to start';

    });

	return router;

}



/*
 * Send a read receipt to indicate the message has been read
 *
 */
function saveUserProfileDate(senderId, senderData) {
    console.log("SAving the user data: " + senderId + ":=" + senderData);


    var Users = require(__base + 'models/users');

	var users = Users({
		id: '100',
			ques: 'Who acted in Bahubali?',
			option: [
				{'optId':'A','optVal':'Shahrukh'},
				{'optId':'B','optVal':'Pawan Kalyan'},
				{'optId':'C','optVal':'Prabhas'},
				{'optId':'D','optVal':'Rajesh'}
			],
			answer: 'C'
	});

	users.save(function(err) {
		if (err) next(err);

		console.log('user created!');
		res.send('user created!');
	});
}

module.saveUserProfileDate = saveUserProfileDate;