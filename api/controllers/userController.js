var User        = require('../models/User')
var bcrypt      = require('bcrypt-nodejs');
var jwt         = require('jsonwebtoken');
var expressJWT  = require('express-jwt')
var passport    = require("passport");
var Q           = require("q");
var validation  = require('../helpers/validation')

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
    delete user.password
    res.status(200).json({user: user})
  })
}

function updatePassword(req, res){
  Q.nfcall(validation.fields, req.body, {old_password: null, new_password: null}, validation.password)
   .then(function(){
     User.read(req.params.user_id, function(err, user){
      if (!validPassword(req.body.old_password, user.password)) return res.status(401).json({ success: false, error: 'Invalid current password' });

      user.password = encrypt(req.body.new_password)
      User.save(user, function(err, user){
        if (err) return res.status(401).json({ success: false, error: err.messasge });
        res.status(201).json({ success: true })
      })
     })
   })
   .catch(function(error){
     res.status(401).json({success: false, message: error});
   })
}

function updateUser(req, res){
  delete req.body.username
  delete req.body.id
  var userParams = User.schema
  delete userParams.username
  delete userParams.password;
  Q.nfcall(validation.fields, req.body, userParams, null)
   .then(function(){
    User.read(req.params.user_id, function(err, user){
      if(err) return res.status(401).json({success: false, error: err});

      user.email     = req.body.email;
      user.name      = req.body.name;
      user.industry  = req.body.industry;
      user.location  = req.body.location;
      user.role     = req.body.role;
      user.anonymous = req.body.anonymous;

      User.save(user, function(err, user){
        if(err) return res.status(401).json({success: false, error: err});
        delete user.username
        delete user.password
        res.status(200).json({ success: true, user: user})
      })
    })
   })
   .catch(function(error){
     res.status(401).json({success: false, message: error});
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
    delete user[0].password

    var myInfo = {username: user[0].username, id: user[0].id}
    var newToken = genToken(myInfo);
    res.status(200).json({success: true, token: newToken, user: user[0]})
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
  postLogin     : postLogin,
  updatePassword: updatePassword
}