var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var showsSchema = new Schema({
  name: String,
  startTime: String,
  endTime: String,
  imageURL: String,
  videoURL: String,
  favUserList: Array,
  description: String,
  tags: Array
});

var shows = mongoose.model('shows', showsSchema);

module.exports = shows;