var express        = require('express');
var router         = express.Router();

var timelineController = require('../controllers/timelineController');
var eventController = require('../controllers/eventController');

router.route('/timelines')
  .get(timelineController.getTimelines)
router.route('/timeline/recommend/:user_id')
  .get(timelineController.getSuggestions)
router.route('/timeline/recommend/:user_id/fav')
  .get(timelineController.getFavRec)
router.route('/timeline/recommend/:user_id/random')
  .get(timelineController.getRandom)
router.route('/timeline/:user_id')
  .get(eventController.getStageEvents)

module.exports = router