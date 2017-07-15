var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
  uname: String,
  fbId: String,
  favShows: Array,
  likes: Array,
  roles: String
});

var users = mongoose.model('users', usersSchema);

module.exports = users;