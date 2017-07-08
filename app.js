var express = require('express');
var facebook = require(__dirname+'/routes/facebook')();
var bodyParser = require('body-parser');

var app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



app.use('/facebook',facebook);
app.get('/', function (req, res) {
    res.send('hello world');
});


app.listen(process.env.PORT || 3000 , function () {
    console.log('Example app listening on port 3000!');
});

