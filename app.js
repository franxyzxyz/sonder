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

url = require('url').parse("http://app44801919:VRPxRxHJBAyBC7AAln7u@app44801919.sb02.stations.graphenedb.com:24789")

db = require("seraph")({
  server: url.protocol + '//' + url.host,
  user: url.auth.split(':')[0],
  pass: url.auth.split(':')[1]
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger('dev'));
app.use(methodOverride('_method'));

app.use(passport.initialize());
app.use(passport.session());
require('./api/config/passport')(passport);

// var helper_method = require('./helpers/helper_function');
var userRoutes = require('./api/config/userRoutes')
var sessionRoutes = require('./api/config/sessionRoutes')
app.use('/api', sessionRoutes)
app.use('/api', expressJWT({secret: process.env.JWT_SECRET}),userRoutes);

var likeRoutes = require('./api/config/likeRoutes')
app.use('/api/', expressJWT({secret: process.env.JWT_SECRET}), likeRoutes)

var favouriteRoutes = require('./api/config/favouriteRoutes')
app.use('/api/', expressJWT({secret: process.env.JWT_SECRET}), favouriteRoutes)

var timelineRoutes = require('./api/config/timelineRoutes')
app.use('/api', expressJWT({secret: process.env.JWT_SECRET}), timelineRoutes)

var stageRoutes = require('./api/config/stageRoutes')
app.use('/api/timeline/', expressJWT({secret: process.env.JWT_SECRET}), stageRoutes)

var eventRoutes = require('./api/config/eventRoutes')
app.use('/api/timeline/', expressJWT({secret: process.env.JWT_SECRET}), eventRoutes)

app.use(function(err, req, res, next){
  if (err) return res.status(401).json({error: err.message})
});

app.listen(process.env.PORT);
console.log("Connected to server")