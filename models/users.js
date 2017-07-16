var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
  name: String,
  timezone: Number,
  birthday: String,
  location: String,
  locale: String,
  email: String,
  imageUrl: String,
  gender: String,
  likes: Array,
  movies: Array
  fbId: String,
  roles: String
});

var users = mongoose.model('users', usersSchema);

module.exports = users;