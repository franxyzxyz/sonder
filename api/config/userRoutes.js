var express        = require('express');
var router         = express.Router();

var userController = require('../controllers/userController');
var authController  = require('../controllers/authController')

router.route('/')
  .get(userController.getAll)

router.route('/user/:user_id')
  .get(authController.checkUserNode, userController.getOne)
  .put(authController.checkUserNode, userController.updateUser)
  .delete(authController.checkUserNode, userController.deleteUser)

module.exports = router