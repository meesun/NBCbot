var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var showsSchema = new Schema({
  name: String,
  startTime: String,
  endTime: String,
  imageURL: String
});

var shows = mongoose.model('shows', showsSchema);

module.exports = shows;