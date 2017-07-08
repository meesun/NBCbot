var express = require('express');
var facebook = require(__dirname+'/routes/facebook')();



var app = express();

app.use('/facebook',facebook);
app.get('/', function (req, res) {
    res.send('hello world');
});


app.listen(process.env.PORT || 3000 , function () {
    console.log('Example app listening on port 3000!');
});

