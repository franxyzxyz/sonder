var Stage       = require('../models/Stage')

function getAllStages(req, res){
  var cypher = "START x = node({id})"
             + "MATCH x -[r:has_stage]-> n "
             + "RETURN n";
  db.query(cypher, {id: parseInt(req.params.user_id)}, function(err, result){
    if (err) return res.status(401).json({error: err})
    res.status(200).json({no_of_stages: result.length, stages: result})
  })
}

function getOneStage(req, res){
  Stage.read(req.params.stage_id, function(err, stage){
    if (err) return res.status(401).json({success: false, error: err});
    res.status(200).json({success: true, stage: stage})
  })
}

function addStage(req, res){
  var newStage = req.body
  newStage.start = new Date(newStage.start);
  newStage.end = new Date(newStage.end);

  Stage.save(newStage, function(err, stage){
    if (err) return res.status(401).json({ success: false, error: err.message});
    db.relate(req.params.user_id, 'has_stage', stage.id, function(err, rel){
      if (err) {
        db.delete(stage.id, true, function(error){
          res.status(401).json({ success: false, error: error})
        })
      }
      res.status(200).json({ success: true, relationship: rel, stage: stage})
    })
  })
}

function updateStage(req, res){
  Stage.read(req.params.stage_id, function(err, stage){
    var updateStage   = req.body;
    stage.start       = new Date(updateStage.start);
    stage.end         = new Date(updateStage.end);
    stage.description = updateStage.description;
    stage.title       = updateStage.title;
    if (!validateDate(stage)){
      return res.status(401).json({success: false, message: 'End date cannot be earlier than the start date'})
    }
    Stage.save(stage, function(err, stage){
      if(err) return res.status(401).json({success: false, error: err.message});
      res.status(200).json({ success: true, stage: stage})
    })
  })
}

function deleteStage(req, res){
  Stage.read(req.params.stage_id, function(err, stage){
    db.delete(req.params.stage_id, true, function(err){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true })
    })
  })
}

function validateDate(stage){
  if (stage.start > stage.end) {
    return false
  }
  return true
}

module.exports = {
  getAllStages     : getAllStages,
  getOneStage      : getOneStage,
  addStage         : addStage,
  updateStage      : updateStage,
  deleteStage      : deleteStage
}