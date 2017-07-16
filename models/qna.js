var mongoose=require("mongoose");
var schema=mongoose.Schema;

var qnaSchema=new schema({
    "userId": Array,
    "show": String,
    "options": Array,
    "answer": String,
    "response": Array,
    "type": String,
    "qn": String
});

var qna = mongoose.model('qna', qnaSchema);

module.exports = qna;