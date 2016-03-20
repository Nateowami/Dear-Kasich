var express = require('express');
var app = express();
var cons = require('consolidate');

app.engine('html', cons.handlebars);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static('public'));

var signatures = [
  { name: "Bob Joe", state: "JK"}
]

app.get('/', function (req, res) {
  res.render('index', {signatures: signatures});
});

console.log("Listening on port %s...", 
  app.listen(process.env.PORT || 3000).address().port);
