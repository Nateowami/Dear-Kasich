var express = require('express');
var app = express();
var cons = require('consolidate');
var bodyParser = require('body-parser')
var db = require('monk')('localhost/dearkasich');
var signers = db.get('signers');

//settings
app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/public'));
app.use(require('morgan')('combined'));

//data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//data
var cache = [];
var privateCount = 0;

//public signers
signers.find({publicly: true}, {sort: {date: -1}}, function (e, signers) {
  if(e) console.log(e);
  cache = signers || [];
});

//private signers
signers.find({publicly: false}, {}, function (e, signers){
  if(e) console.log(e);
  else privateCount = signers.length;
});

//logging
app.use(function(req, res, next){
  next();
});

app.get('/', function (req, res) {
  res.render('index', {signatures: cache, privateCount: privateCount});
});

app.post('/sign', function(req, res){
  var b = req.body;
  var data = {
    name: req.body.name,
    state: b.state,
    publicly: b.publicly,
    email: b.email,
    meta: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referer: req.body.referer //as specified in the body by client-js
    }
  }
  
  signers.insert(data, function(error, doc){
    if(error){
      console.log(error)
    }
    else {
      console.log(doc);
      
      //cache signer, as a count if private, or name/state if public
      if(doc.publicly) cache.unshift(doc);
      else privateCount++;
      
      res.send(JSON.stringify({
        name: data.name,
        state: data.state,
        publicly: data.publicly
      }));
    }
  });
  
});

console.log("Listening on port %s...", 
  app.listen(process.env.PORT || 3000).address().port);
