var Stage       = require('../models/Stage')

function getAllStages(req, res){
  var cypher = "START x = node({id})"
             + "MATCH x -[r:has_stage]-> n "
             + "RETURN n";
  db.readLabels(req.params.user_id, function(err, label){
    if (label.indexOf('user') == -1) return res.status(401).json({ message: 'not a valid user node'});
    db.query(cypher, {id: parseInt(req.params.user_id)}, function(err, result){
      if (err) return res.status(401).json({error: err})
      res.status(200).json({no_of_stages: result.length, stages: result})
    })
  })
}

function getOneStage(req, res){
  Stage.read(req.params.stage_id, function(err, stage){
    if (err) return res.status(401).json({success: false, error: err});
    if (!stage) return res.status(401).json({success: false, error: 'Invalid stage id'});
    res.status(200).json({success: true, stage: stage})
  })
}

function addStage(req, res){
  var newStage = req.body
  newStage.start = new Date(newStage.start);
  newStage.end = new Date(newStage.end);

  Stage.save(newStage, function(err, stage){
    if (err) return res.status(401).json({ success: false, error: err});
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
    if (!stage) return res.status(401).json({success: false, error: 'Invalid stage id'});

    var updateStage   = req.body;
    stage.start       = new Date(updateStage.start);
    stage.end         = new Date(updateStage.end);
    stage.description = updateStage.description;
    stage.title       = updateStage.title;
    if (!validateDate(stage.start, stage.end)){
      return res.status(401).json({success: false, message: 'End date cannot be earlier than the start date'})
    }
    Stage.save(stage, function(err, stage){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true, stage: stage})
    })
  })
}

function deleteStage(req, res){
  Stage.read(req.params.stage_id, function(err, stage){
    if (!stage) return res.status(401).json({success: false, error: 'Invalid stage id'});

    db.delete(req.params.stage_id, true, function(err){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true })
    })
  })
}

function isUserAuthorized(req, res, next){
  var cypher = "START x = node({id})"
             + "RETURN x";
  dbQuery(req, res, next, cypher, {id: parseInt(req.params.user_id)})
}

function isAuthorized(req, res, next){
  var cypher = "START x = node({id})"
             + "MATCH n -[r]-> x "
             + "WHERE TYPE(r) = {type}"
             + "RETURN n";
  dbQuery(req, res, next, cypher, {id: parseInt(req.params.stage_id), type:'has_stage'})
}

function dbQuery(req, res, next, cypher, params){
  db.query(cypher, params, function(err, result){
    if (err) return res.status(401).json({error: err});
    if (result[0].username !== req.user.username) return res.status(401).json({success: false, error: 'Account not authorized for the action'});
    return next();
  })
}

function validateDate(start, end){
  if (start > end) {
    return false
  }
  return true
}

module.exports = {
  getAllStages     : getAllStages,
  getOneStage      : getOneStage,
  addStage         : addStage,
  updateStage      : updateStage,
  deleteStage      : deleteStage,
  isAuthorized     : isAuthorized,
  isUserAuthorized : isUserAuthorized
}