var LocalStrategy   = require('passport-local').Strategy;
var seraphModel     = require('seraph-model');
var User            = seraphModel(db, 'user');
var UserSchema      = require('../models/User').schema;
var bcrypt          = require('bcrypt-nodejs');
var validation      = require('../helpers/validation')
var Q               = require("q");

module.exports = function(passport){
  passport.serializeUser(function(user, done) {
    done(null, user[0].id);
  });

  passport.deserializeUser(function(id, done) {
    User.read(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField : 'username',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, username, password, callback) {
    User.where({username: username}, function(err, user){
      if (err) return callback(err);

      if (user.length !== 0){
        return callback(null, false, {message: 'Oops! username has been taken'})
      }else{
        var newUser = req.body;
        Q.nfcall(validation.fields, req.body, UserSchema, null)
         .then(function(){
           newUser.password = encrypt(newUser.password);
           User.save(newUser, function(err, user){
             if (err) return callback(null, false, {message: err.code});
             return callback(null, newUser, {message: 'successfully signed up'})
           })
         })
         .catch(function(error){
          callback(null, false, {message: error})
         })
      }
    })
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback : true
  },function(req, username, password, callback){
    var loginParams = req.body
    Q.nfcall(validation.fields, loginParams, {username:null, password: null}, null)
     .then(function(){
      User.where({username: username}, function(err, user){
        if (err) return callback(err);
        if (user.length == 0) return callback(null, false, {message: 'cannot find user'});

        if (!validPassword(password, user[0].password)) return callback(null, false, {message: 'password does not match'});

        return callback(null, user, {message: 'successfully logged in'});
      })
     })
     .catch(function(error){
       res.status(401).json({success: false, message: error});
     })
  }))
}

function encrypt (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(password, basePassword) {
  return bcrypt.compareSync(password, basePassword);
};