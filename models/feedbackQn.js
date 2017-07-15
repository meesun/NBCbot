var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var feedbackQn = new Schema({
    "qn": String,
    "qnOptions": Array
});

var feedbackQn = mongoose.model('feedback_qn', feedbackQn);

module.exports = feedbackQn;