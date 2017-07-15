var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackAns = new Schema({
      "qnId": String,
    "userId": String,
    "answer": String
});

var feedbackAns = mongoose.model('feedback_ans', feedbackAns);

module.exports = feedbackAns;