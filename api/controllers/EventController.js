var Event       = require('../models/Event')
var Stage       = require('../models/Stage')
var Q           = require("q");

function getEvents(req, res){
  var cypher = "START user = node({id})"
             + "MATCH user -[:has_stage]-> stage -[r:has_event]-> event "
             + "RETURN event";
  Q.nfcall(checkNodeType, req.params, 'user')
   .then(function(){
    db.query(cypher, {id: parseInt(req.params.user_id)}, function(err, result){
      if (err) return res.status(401).json({error: err})
      res.status(200).json({success:true, no_of_events: result.length, events: result})
    })
   })
   .catch(function(error){
      res.status(401).json({success: false, message: error});
   })
}

function addEvent(req, res){
  var newEvent = req.body;
  newEvent.date = new Date(newEvent.date);

  Stage.read(req.params.stage_id, function(err, stage){
    Q.nfcall(dateRangeValidation, newEvent.date, stage)
     .then(dateValidation)
     .then(function(){
        Event.save(newEvent, function(err, event){
          if (err) return res.status(401).json({ success: false, error: err });
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
    if (!event) return res.status(401).json({ success: false, error: 'Invalid event id' });
    res.status(200).json({ success: true, event: event })
  })
}

function updateEvent(req, res){
  var cypher = "START event = node({id})"
             + "MATCH stage -[r:has_event]-> event "
             + "RETURN stage, event";
  var updateEvent = req.body;

  db.query(cypher, {id: parseInt(req.params.event_id)}, function(err, result){
    if (err) return res.status(401).json({ success: false, error: err });
    if (result.length == 0) return res.status(401).json({ success: false, error: 'Invalid event id' });
    Q.nfcall(fieldsValidation, updateEvent, result)
     .then(dateRangeValidation_q)
     .then(function(){
      var event = result[0].event;

      event.title        = updateEvent.title;
      event.event_type   = updateEvent.event_type;
      event.date         = new Date(updateEvent.date);
      event.description  = updateEvent.description;
      event.tag          = updateEvent.tag;

      Event.save(event, function(err, event){
        if (err) throw err;
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
    if (!event) return res.status(401).json({ success: false, error: 'Invalid event id' });
    db.delete(req.params.event_id, true, function(err){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true })
    });
  })
}

function checkNodeType(params, type, callback){
  db.readLabels(params[type + '_id'], function(err, label){
    if (!label || label.indexOf(type) == -1) return callback('Invalid ' + type + ' id');
    if (type == 'stage'){
      return callback(null, true)
    }
    return checkNodeType(params, 'stage', callback)
  })
}

function fieldsValidation(body, result, callback){
  for (prop in body){
    if (Object.keys(result[0].event).indexOf(prop) == -1) throw 'fields unmatch';
  }
  callback(null, [body.date, result[0].stage])
}

function dateRangeValidation(date, stage, callback){
  if (date < stage.start || date > stage.end) throw 'date of event is out of the range of the requested stage';
  callback(null, date)
}

function dateRangeValidation_q(params){
  var date  = new Date(params[0])
  var stage = params[1]
  if (date < stage.start || date > stage.end) throw 'date of event is out of the range of the requested stage';
  return dateValidation(date)
}

function dateValidation(date){
  if (date == 'Invalid Date') throw 'Invalid Date';
}

module.exports = {
  getEvents     : getEvents,
  addEvent      : addEvent,
  getEvent      : getEvent,
  updateEvent   : updateEvent,
  deleteEvent   : deleteEvent,
}