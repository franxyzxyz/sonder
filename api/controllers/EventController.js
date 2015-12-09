var Event       = require('../models/Event')
var Stage       = require('../models/Stage')
var Q           = require("q");

function addEvent(req, res){
  var newEvent = req.body;
  newEvent.date = new Date(newEvent.date);
  if (!eventDateValidation(newEvent.date)) return res.status(401).json({success: false, message: 'date is not valid'});

  // Check if Event's date is within stage's start-end
  Stage.read(req.params.stage_id, function(err, stage){
    if (newEvent.date < stage.start || newEvent.date > stage.end) return res.status(401).json({success: false, message: 'date of event is out of the range of the requested stage'});

    // newEvent.tag is an array
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
}

function getEvent(req, res){
  Event.read(req.params.event_id, function(err, event){
    if (err) return res.status(401).json({ success: false, error: err });
    if (!event) return res.status(401).json({ success: false, error: 'not an event' });
    res.status(200).json({ success: true, event: event })
  })
}

function updateEvent(req, res){
  Event.read(req.params.event_id, function(err, event){
    var updateEvent = req.body;
    if (!validateFields(updateEvent, event)) return res.status(401).json({success: false, message: 'fields unmatch'});

    event.title        = updateEvent.title;
    event.event_type   = updateEvent.event_type;
    event.date         = new Date(updateEvent.date);
    event.description  = updateEvent.description;
    event.tag          = updateEvent.tag;

    if (!eventDateValidation(event.date)) return res.status(401).json({success: false, message: 'date is not valid'});

    Event.save(event, function(err, event){
      if (err) throw err;
      res.status(200).json({success: true, event: event})
    })
  })
}

function deleteEvent(req, res){
  Event.read(req.params.event_id, function(err, event){
    if (err) return res.status(401).json({ success: false, error: err });
    if (!event) return res.status(401).json({ success: false, error: 'not an event' });
    db.delete(req.params.event_id, true, function(err){
      if(err) return res.status(401).json({success: false, error: err});
      res.status(200).json({ success: true })
    });
  })
}

function validateLabel(node_id, type){
  db.readLabels(node_id, function(err, labels){
    return Q.fcall(labelprocess, labels, type)
     .then(function(value){
      return value
     }, function(err){
      throw err
     }).done();
  })
}

function labelprocess(label, type){
  if (label.indexOf(type) == -1){
    return false
  }else{
    return true
  }
}

function validateFields(body, event){
  for (prop in body){
    if (Object.keys(event).indexOf(prop) == -1) return false;
  }
  return true
}

function eventDateValidation(date){
  if (date == 'Invalid Date'){
    return false
  }else{
    return true
  }
}

module.exports = {
  addEvent      : addEvent,
  getEvent      : getEvent,
  updateEvent   : updateEvent,
  deleteEvent   : deleteEvent
}