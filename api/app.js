var express        = require('express');
var logger         = require('morgan');
var bodyParser     = require('body-parser');
var connect        = require('connect')
var methodOverride = require('method-override')
var app            = express();
// var emailRegex = require('email-regex');

db = require("seraph")("http://localhost:7474");
// var seraphModel = require('seraph-model');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(methodOverride('_method'))

var router = require('./config/routes')
app.use('/api',router);


// User.save(newUser, function(err, user){
//   if(err) throw err;

//   console.log(user)
// })

// db.find({},function(err, nodes){
//   console.log(nodes)
// })

app.listen(3000);
console.log("Connected to server")