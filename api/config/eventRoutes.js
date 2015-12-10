var express        = require('express');
var router         = express.Router();

var eventController = require('../controllers/eventController');
var authController  = require('../controllers/authController')

router.route('/:user_id/stage/:stage_id/events')
  .get(eventController.getEvents)
  .post(authController.isUserAuthorized, eventController.addEvent)

router.route('/event/:event_id')
  .get(eventController.getEvent)
  .put(authController.isEventAuthorized, eventController.updateEvent)
  .delete(authController.isEventAuthorized, eventController.deleteEvent)

module.exports = router