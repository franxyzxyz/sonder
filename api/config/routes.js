var express        = require('express'),
    router         = express.Router();

var userController = require('../controllers/userController');

router.route('/')
  .get(userController.getAll)

router.route('/signup')
  .post(userController.createUser)

router.route('/user/:user_id')
  .get(userController.getOne)
  .put(userController.updateUser)
  .delete(userController.deleteUser)

module.exports = router