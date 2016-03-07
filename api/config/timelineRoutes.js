var express        = require('express');
var router         = express.Router();

var timelineController = require('../controllers/timelineController');
var eventController = require('../controllers/eventController');

router.route('/timelines')
  .get(timelineController.getTimelines)

router.route('/timeline/explore/:user_id/metoo')
  .get(timelineController.getCurated_metoo)
router.route('/timeline/explore/:user_id/fav')
  .get(timelineController.getCurated_fav)
router.route('/timeline/explore/:user_id/like')
  .get(timelineController.getCurated_like)

router.route('/timeline/recommend/:user_id')
  .get(timelineController.getSuggestions)
router.route('/timeline/recommend/:user_id/fav')
  .get(timelineController.getFavRec)
router.route('/timeline/recommend/:user_id/random')
  .get(timelineController.getRandom)
router.route('/timeline/:user_id')
  .get(eventController.getStageEvents)

router.route('/timeline/search_by/:type/:sort_type')
  .get(timelineController.searchBy)

router.route('/timeline/search/keywords')
  .get(timelineController.searchKey)
module.exports = router