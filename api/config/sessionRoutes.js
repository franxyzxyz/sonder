var express        = require('express');
var router         = express.Router();

var userController = require('../controllers/userController');

router.route('/login')
  .post(userController.postLogin)

router.route('/signup')
  .post(userController.postSignup)

module.exports = router