var express        = require('express');
var router         = express.Router();

var likeController = require('../controllers/likeController');
var authController  = require('../controllers/authController')

router.route('/timeline/:user_id/likes')
  .get(authController.checkUserNode, likeController.getLikedEvents)

router.route('/event/:event_id/likes')
  .get(authController.checkEventNode,
       likeController.getEventLikes)
  .post(authController.checkEventNode,
        likeController.addLike)

router.route('/timeline/like/:like_id')
  .get(authController.checkLikeRel, likeController.getLike)
  .delete(authController.checkLikeRel,
          authController.isRelOwner,
          likeController.deleteLike)

router.route('/timeline/:user_id/likedby')
  .get(authController.checkUserNode, likeController.getLikedBy)


module.exports = router