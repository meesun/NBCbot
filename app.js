var express = require('express');
var facebook = require(__dirname+'/routes/facebook')();



var app = express();

app.use('/facebook',facebook);
app.get('/', function (req, res) {
    res.send('hello world');
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'poda dai') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.listen(process.env.PORT || 3000 , function () {
    console.log('Example app listening on port 3000!');
});

