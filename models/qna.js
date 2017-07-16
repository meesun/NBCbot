var mongoose=require("mongoose");
var schema=mongoose.Schema;

var qna=new schema({
    "userId": Array,
    "show": String,
    "options": Array,
    "answer": String,
    "response": Array,
    "type": String,
    "qn": String
});

var qna = mongoose.model('qna', qna);

module.exports = qna;