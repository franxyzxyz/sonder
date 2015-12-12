var express        = require('express');
var router         = express.Router();

var favouriteController = require('../controllers/favouriteController');
var authController  = require('../controllers/authController')

router.route('/timeline/:user_id/favourites')
  .get(authController.checkUserNode, favouriteController.getFavourites)
  .post(authController.checkUserNode, favouriteController.addFavourite)

router.route('/timeline/favourite/:favourite_id')
  .delete(authController.checkFavRel,
          favouriteController.deleteFavourite)

router.route('/user/:user_id/favourites')
  .get(authController.checkUserNode,
       favouriteController.getUserFavourites)


module.exports = router