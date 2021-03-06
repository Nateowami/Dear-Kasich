var express = require('express');
var app = express();
var cons = require('consolidate');
var handlebars = require('handlebars');
var bodyParser = require('body-parser')
var db = require('monk')('localhost/dearkasich');
var signers = db.get('signers');

// Configure Consolidate Handlebars with custom helpers.
cons.requires.handlebars = handlebars;
// Converts the last section of a name with at least two parts to an initial, for privacy's sake.
cons.requires.handlebars.registerHelper('nameToFirstAndInitial', function nameToFirstAndInitial(name) {
  name = name.trim();
  var splitName = name.split(' ');
  var finalName = name;

  if(splitName.length >= 2) {
    if(splitName[splitName.length - 1] && splitName[splitName.length - 1][0]) {
      splitName[splitName.length - 1] = splitName[splitName.length - 1][0]
      .toUpperCase();
      finalName = splitName.join(' ');
    }
  }

  return finalName;
});

//settings
app.enable('trust proxy');
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
signers.find({publicly: true}, {sort: {'_id': -1}}, function (e, signers) {
  if(e) console.log(e);
  cache = signers || [];
});

//private signers
signers.find({publicly: false}, {}, function (e, signers){
  if(e) console.log(e);
  else privateCount = signers.length;
});

app.get('/', function (req, res) {
  res.render('index', {
    signatures: cache,
    privateCount: privateCount,
    //only serve google analytics in production
    analytics: app.get('env') == 'production'
  });
});

//for 404s
app.use(function(req, res){
  res.status(404).render('error', {code: 404, msg: 'Page not found'});
  console.log('404 response for ' + req.url);
});

//for 500s
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).render('error', {code: 500, msg: 'Internal server error', stack: app.get('env') == 'production' ? null : err.stack});
});

console.log('Listening on port %s...',
  app.listen(process.env.PORT || 3000).address().port);
