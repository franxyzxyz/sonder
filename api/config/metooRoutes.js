var express        = require('express');
var router         = express.Router();

var metooController = require('../controllers/metooController');
var authController  = require('../controllers/authController')

router.route('/timeline/:user_id/metoo')
  .get(authController.checkUserNode, metooController.getMetooUsers)

router.route('/event/:event_id/metoo')
  .post(authController.checkEventNode,
        metooController.addMetoo_event)

router.route('/timeline/metoo/:metoo_id')
  .delete(authController.checkMetooRel,
          authController.isRelOwner,
          metooController.deleteMetoo)

module.exports = router