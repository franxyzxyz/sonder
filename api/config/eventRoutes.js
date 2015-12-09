var express        = require('express');
var router         = express.Router();

var eventController = require('../controllers/eventController');

router.route('/:user_id/stage/:stage_id/events')
  .post(eventController.addEvent)

router.route('/event/:event_id')
  .get(eventController.getEvent)
  .put(eventController.updateEvent)
  .delete(eventController.deleteEvent)

module.exports = router