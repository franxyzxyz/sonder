var express        = require('express');
var router         = express.Router();

var eventController = require('../controllers/eventController');
var authController  = require('../controllers/authController')

router.route('/:user_id/stage/:stage_id/events')
  .get(authController.checkUserNode,
       authController.checkStageNode,
       eventController.getStageEvents)
  .post(authController.checkUserNode,
        authController.checkStageNode,
        authController.isUserAuthorized,
        eventController.addEvent)

router.route('/:user_id/events')
  .get(authController.checkUserNode,
       eventController.getStageEvents)

router.route('/event/:event_id')
  .get(authController.checkEventNode,
       eventController.getEvent)
  .put(authController.checkEventNode,
       authController.isEventAuthorized,
       eventController.updateEvent)
  .delete(authController.checkEventNode,
          authController.isEventAuthorized,
          eventController.deleteEvent)

module.exports = router