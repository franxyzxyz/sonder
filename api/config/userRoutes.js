var express        = require('express');
var router         = express.Router();

var userController = require('../controllers/userController');
var authController  = require('../controllers/authController')

router.route('/')
  .get(userController.getAll)

router.route('/user/:user_id')
  .get(authController.checkUserNode, userController.getOne)
  .put(authController.checkUserNode,
       authController.isUserAuthorized,
       userController.updateUser)
  .delete(authController.checkUserNode,
          authController.isUserAuthorized,
          userController.deleteUser)

router.route('/user/:user_id/password')
  .put(authController.checkUserNode,
       authController.isUserAuthorized,
       userController.updatePassword)

module.exports = router