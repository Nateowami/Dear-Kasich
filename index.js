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
app.use('/static', express.static('public'));
app.use(require('morgan')('combined'));

//data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//data
var cache = [];

signers.find({}, {sort: {date: 1}}, function (e, signers) {
  if(e) console.log(e);
  cache = signers || [];
});

//logging
app.use(function(req, res, next){
  next();
});

app.get('/', function (req, res) {
  res.render('index', {signatures: cache});
});

app.post('/sign', function(req, res){
  var b = req.body;
  var data = {
    name: req.body.name,
    state: b.state,
    publicly: b.publicly,
    email: b.email,
    meta: b.meta, //meta-data, for helping make sure users are unique, we log IP, useragent, etc., not unlike most analytics solutions
    date: new Date()
  }
  
  cache.push(data);
  
  signers.insert(data, function(error){
    console.log(error);
    res.send(JSON.stringify({
      name: data.name,
      state: data.state,
      publicly: data.publicly
    }));
  });
  
});

console.log("Listening on port %s...", 
  app.listen(process.env.PORT || 3000).address().port);
