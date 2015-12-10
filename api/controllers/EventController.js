var Event       = require('../models/Event')
var Stage       = require('../models/Stage')
var Q           = require("q");

function getStageEvents(req, res){
  var cypher = "START user = node({id}) "
             + "MATCH user -[:has_stage]-> stage -[:has_event]-> event ";
  if (req.params.stage_id){
    cypher += "WHERE id(stage) = {stage_id} " + "RETURN event";
  }else{
    cypher += "RETURN event";
  }
  db.query(cypher, {id: parseInt(req.params.user_id), stage_id: parseInt(req.params.stage_id)}, function(err, result){
    if (err) return res.status(401).json({error: err.message})
    res.status(200).json({success:true, no_of_events: result.length, events: result})
  })
}

function addEvent(req, res){
  var newEvent = req.body;
  newEvent.date = new Date(newEvent.date);
  Stage.read(req.params.stage_id, function(err, stage){
    Q.nfcall(fieldsValidate, newEvent, stage)
     .then(function(value){
      Event.save(newEvent, function(err, event){
        if (err) return res.status(401).json({ success: false, error: err.message });
        db.relate(req.params.stage_id, 'has_event', event.id, function(err, rel){
          if (err){
            db.delete(event.id, true, function(error){
              if (error) return res.status(401).json({ success: false, error: error });
              return res.status(401).json({ success: false, error: err })
            })
          };
          res.status(200).json({ success: true, event: event, relationship: rel})
        })
      })
     })
     .catch(function(error){
      res.status(401).json({success: false, message: error});
     })
  })
}

function getEvent(req, res){
  Event.read(req.params.event_id, function(err, event){
    if (err) return res.status(401).json({ success: false, error: err });
    res.status(200).json({ success: true, event: event })
  })
}

function updateEvent(req, res){
  var cypher = "START event = node({id})"
             + "MATCH stage -[r:has_event]-> event "
             + "RETURN stage, event";
  var updateEvent = req.body;
  db.query(cypher, {id: parseInt(req.params.event_id)}, function(err, result){
    if (err) return res.status(401).json({ success: false, error: err.message });
    Q.nfcall(fieldsValidate, updateEvent, result[0].stage)
     .then(function(){
      var event = result[0].event;

      event.title        = updateEvent.title;
      event.event_type   = updateEvent.event_type;
      event.date         = new Date(updateEvent.date);
      event.description  = updateEvent.description;
      event.tag          = updateEvent.tag;

      Event.save(event, function(err, event){
        if (err) return res.status(401).json({success: false, error: err.message});
        res.status(200).json({success: true, event: event})
      })
     })
     .catch(function(error){
      res.status(401).json({success: false, message: error});
     })
  })
}

function deleteEvent(req, res){
  Event.read(req.params.event_id, function(err, event){
    if (err) return res.status(401).json({ success: false, error: err });
    db.delete(req.params.event_id, true, function(err){
      if(err) return res.status(401).json({success: false, error: err.message});
      res.status(200).json({ success: true })
    });
  })
}

function fieldsValidate(newBody, stage, callback){
  for (prop in newBody){
    if (Object.keys(Event.schema).indexOf(prop) == -1) throw 'fields unmatch';
  }
  return dateRangeValidate(newBody.date, stage, callback)
}

function dateRangeValidate(date, stage, callback){
  if (date < stage.start || date > stage.end) throw 'date of event is out of the range of the requested stage';
  return dateValidation(date, callback)
}

function dateValidation(date, callback){
  if (date == 'Invalid Date') throw 'Invalid Date';
  callback(null, date)
}

module.exports = {
  getStageEvents: getStageEvents,
  addEvent      : addEvent,
  getEvent      : getEvent,
  updateEvent   : updateEvent,
  deleteEvent   : deleteEvent,
}