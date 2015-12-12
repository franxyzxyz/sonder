var express        = require('express');
var router         = express.Router();

var timelineController = require('../controllers/timelineController');
var eventController = require('../controllers/eventController');

router.route('/timelines')
  .get(timelineController.getTimelines)

router.route('/timeline/:user_id')
  .get(eventController.getStageEvents)

module.exports = router