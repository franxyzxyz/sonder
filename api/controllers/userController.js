var User = require('../models/User')

function getAll(req, res){
  User.findAll(function(err, users){
    res.status(200).json({users: users})
  })
}

function createUser(req, res){
  var newUser = req.body
  User.save(newUser, function(err, user){
    if(err) return res.status(409).json(err);
    res.status(200).json({user: user})
  })
}

function getOne(req, res){
  User.read(req.params.user_id, function(err, user){
    if(err) return res.status(401).json({success: false, error: err});
    res.status(200).json({user: user})
  })
}

function updateUser(req, res){
  User.read(req.params.user_id, function(err, user){
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
  db.delete(req.params.user_id,function(err, nodes){
    if(err) return res.status(401).json({success: false, error: err});
    res.status(200).json({ success: true })
  })
}

module.exports = {
  getAll      : getAll,
  createUser  : createUser,
  getOne      : getOne,
  updateUser  : updateUser,
  deleteUser  : deleteUser
}