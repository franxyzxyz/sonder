var express        = require('express');
var logger         = require('morgan');
var bodyParser     = require('body-parser');
var connect        = require('connect')
var methodOverride = require('method-override')
var app            = express();
var expressJWT     = require('express-jwt');
var passport       = require("passport");
var Q              = require("q");

// var emailRegex = require('email-regex');
require('dotenv').load();

// db = require("seraph")("http://localhost:7474");


url = require('url').parse(process.env.GRAPHSTORY_URL)
console.log(url)
console.log(url.auth)

db = require("seraph")(process.env.GRAPHSTORY_URL);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(methodOverride('_method'));

app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

// var helper_method = require('./helpers/helper_function');
var userRoutes = require('./config/userRoutes')
var sessionRoutes = require('./config/sessionRoutes')
app.use('/api', sessionRoutes)
app.use('/api', expressJWT({secret: process.env.JWT_SECRET}),userRoutes);

var likeRoutes = require('./config/likeRoutes')
app.use('/api/', expressJWT({secret: process.env.JWT_SECRET}), likeRoutes)

var favouriteRoutes = require('./config/favouriteRoutes')
app.use('/api/', expressJWT({secret: process.env.JWT_SECRET}), favouriteRoutes)

var timelineRoutes = require('./config/timelineRoutes')
app.use('/api', expressJWT({secret: process.env.JWT_SECRET}), timelineRoutes)

var stageRoutes = require('./config/stageRoutes')
app.use('/api/timeline/', expressJWT({secret: process.env.JWT_SECRET}), stageRoutes)

var eventRoutes = require('./config/eventRoutes')
app.use('/api/timeline/', expressJWT({secret: process.env.JWT_SECRET}), eventRoutes)




app.use(function(err, req, res, next){
  if (err) return res.status(401).json({error: err.message})
});

app.listen(3000);
console.log("Connected to server")