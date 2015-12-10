var express        = require('express');
var router         = express.Router();

var stageController = require('../controllers/stageController');
var authController  = require('../controllers/authController')

router.route('/:user_id/stages')
  .get(stageController.getAllStages)
  .post(authController.isUserAuthorized, stageController.addStage)

router.route('/stage/:stage_id')
  .get(stageController.getOneStage)
  .put(authController.isStageAuthorized, stageController.updateStage)
  .delete(authController.isStageAuthorized, stageController.deleteStage)

module.exports = router