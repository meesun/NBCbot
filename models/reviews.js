var mongoose=require('mongoose');
var schema = mongoose.Schema;

var reviewSchema = new schema({
  userId: String,
    show: String,
    review: String
});

var reviews = mongoose.model('reviews', reviewSchema);

module.exports = reviews;
 