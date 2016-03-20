var express = require('express');
var app = express();
var cons = require('consolidate');
var bodyParser = require('body-parser')

//settings
app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static('public'));

//data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//data
var signatures = [
  { name: "Bob Joe", state: "JK"}
]

//logging
app.use(function(req, res, next){
  console.log("Request for " + req.url);
  next();
});

app.get('/', function (req, res) {
  res.render('index', {signatures: signatures});
});

app.post('/sign', function(req, res){
  var b = req.body;
  var data = {
    name: req.body.name,
    state: b.state,
    publicly: b.publicly,
    email: b.email,
    meta: b.meta //meta-data, for helping make sure users are unique, we log IP, useragent, etc., not unlike most analytics solutions
  }
  
  console.log(data);
  
  signatures.push(data);
  
  res.send(JSON.stringify({
    name: data.name,
    state: data.state,
    publicly: data.publicly
  }));
  
});

console.log("Listening on port %s...", 
  app.listen(process.env.PORT || 3000).address().port);
