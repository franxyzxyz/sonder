var express        = require('express');
var router         = express.Router();

var userController = require('../controllers/userController');

router.route('/')
  .get(userController.getAll)

router.route('/user/:user_id')
  .get(userController.getOne)
  .put(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router