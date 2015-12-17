var express        = require('express');
var router         = express.Router();

var timelineController = require('../controllers/timelineController');
var eventController = require('../controllers/eventController');

router.route('/browse')
  .get(timelineController.getRandom)

module.exports = router