var Stage       = require('../models/Stage')
var Q           = require("q");

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

  Q.nfcall(stageFieldsValidate, newStage)
   .then(function(){
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
   })
   .catch(function(error){
     res.status(401).json({success: false, message: error});
   })
}

function updateStage(req, res){
  Stage.read(req.params.stage_id, function(err, stage){
    var updateStage   = req.body;

    Q.nfcall(stageFieldsValidate, updateStage)
     .then(function(){
      stage.start       = new Date(updateStage.start);
      stage.end         = new Date(updateStage.end);
      stage.description = updateStage.description;
      stage.title       = updateStage.title;

      Stage.save(stage, function(err, stage){
        if(err) return res.status(401).json({success: false, error: err.message});
        res.status(200).json({ success: true, stage: stage})
      })
     })
     .catch(function(error){
       res.status(401).json({success: false, message: error});
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

function stageFieldsValidate(newBody, callback){
  if (Object.keys(newBody).length !== Object.keys(Stage.schema).length) throw 'fields unmatch';

  for (prop in newBody){
    if (Object.keys(Stage.schema).indexOf(prop) == -1) throw 'fields unmatch';
  }
  return startEndValidation(newBody, callback)
}

function startEndValidation(stage, callback){
  if (new Date(stage.start) > new Date(stage.end)) throw 'start date cannot be later than the end date'
  callback(null, true)
}

module.exports = {
  getAllStages     : getAllStages,
  getOneStage      : getOneStage,
  addStage         : addStage,
  updateStage      : updateStage,
  deleteStage      : deleteStage
}