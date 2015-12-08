var LocalStrategy   = require('passport-local').Strategy;
var seraphModel     = require('seraph-model');
var User            = seraphModel(db, 'user');
var bcrypt          = require('bcrypt-nodejs');

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
        return callback(null, false, {message: 'username exists'})
      }else{
        var newUser = req.body;
        newUser.password = encrypt(newUser.password);
        User.save(newUser, function(err, user){
          if (err) return callback(null, false, {message: err});
          return callback(null, newUser, {message: 'successfully signed up'})
        })
      }
    })
  }));

  passport.use('local-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback : true
  },function(req, username, password, callback){
    User.where({username: username}, function(err, user){
      if (err) return callback(err);
      if (!user) return callback(null, false, {message: 'cannot find user'});

      if (!validPassword(password, user[0].password)) return callback(null, false, {message: 'password does not match'});

      return callback(null, user, {message: 'successfully logged in'});
    })
  }))
}

function encrypt (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(password, basePassword) {
  return bcrypt.compareSync(password, basePassword);
};