var User        = require('../models/User')
var bcrypt      = require('bcrypt-nodejs');
var jwt         = require('jsonwebtoken');
var expressJWT  = require('express-jwt')
var passport    = require("passport");

function getAll(req, res){
  User.findAll(function(err, users){
    res.status(200).json({users: users})
  })
}

function postSignup(req, res, next){
  passport.authenticate('local-signup',function(err, callback, message){
    if (err) throw err;
    if (!callback) return res.status(401).json({success: false, message: message.message});
    res.status(200).json({success: true, user: callback, message: message.message})
  })(req, res, next)
}

function getOne(req, res){
  User.read(req.params.user_id, function(err, user){
    if(err) return res.status(401).json({success: false, error: err});
    res.status(200).json({user: user})
  })
}

function updateUser(req, res){
  User.read(req.params.user_id, function(err, user){
    if(err) return res.status(401).json({success: false, error: err});

    user.name      = req.body.name;
    user.category  = req.body.category;
    user.location  = req.body.location;
    user.anonymous = req.body.anonymous;

    User.save(user, function(err, user){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true, user: user})
    })
  })
}

function deleteUser(req, res){
  User.read(req.params.user_id, function(err, user){
    if(err) return res.status(401).json({success: false, error: err});

    db.delete(req.params.user_id, true, function(err, nodes){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true })
    })
  })
}

function postLogin(req, res, next){
  passport.authenticate('local-login',function(err, callback, message){
    if (err) throw err;
    if (!callback) return res.status(401).json({message: message.message})

    var user = callback;

    var myInfo = {username: user[0].username, id: user[0].id}
    var newToken = genToken(myInfo);
    res.status(200).json({success: true, token: newToken})
  })(req, res, next)
}

function genToken(userInfo){
  var token = jwt.sign(userInfo, process.env.JWT_SECRET);
  return token
}

function encrypt (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

function validPassword(password, basePassword) {
  return bcrypt.compareSync(password, basePassword);
};

module.exports = {
  getAll        : getAll,
  getOne        : getOne,
  updateUser    : updateUser,
  deleteUser    : deleteUser,
  postSignup    : postSignup,
  postLogin     : postLogin
}