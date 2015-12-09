var express        = require('express');
var router         = express.Router();

var stageController = require('../controllers/stageController');

router.route('/:user_id/stages')
  .get(stageController.getAllStages)
  .post(stageController.addStage)

router.route('/stage/:stage_id')
  .get(stageController.getOneStage)
  .put(stageController.updateStage)
  .delete(stageController.deleteStage)

module.exports = router