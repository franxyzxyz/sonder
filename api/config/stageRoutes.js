var express        = require('express');
var router         = express.Router();

var stageController = require('../controllers/stageController');
var authController  = require('../controllers/authController')

router.route('/:user_id/stages')
  .get(authController.checkUserNode,
       stageController.getAllStages)
  .post(authController.checkUserNode,
        authController.isUserAuthorized,
        stageController.addStage)

router.route('/stage/:stage_id')
  .get(authController.checkStageNode,
       stageController.getOneStage)
  .put(authController.checkStageNode,
       authController.isStageAuthorized,
       stageController.updateStage)
  .delete(authController.checkStageNode,
          authController.isStageAuthorized,
          stageController.deleteStage)

module.exports = router