var validation  = require('../helpers/validation')
var Q           = require("q");
var _           = require('underscore');

function getMetooUsers(req, res){
  var cypher = "START user = node({id}) "
             + "MATCH user -[:has_stage]-> stage -[:has_event]-> event <-[r:me_too]- users "
             + "RETURN users, r "
  db.query(cypher, {id: parseInt(req.params.user_id)}, function(err, result){
    if (err) return res.status(401).json({success: false, error: err.message});
    var rels = []
    result.forEach(function(elem){
      rels.push({user_id: elem.users.id, rel_id: elem.r.id})
    })
    res.status(200).json({metoo_count: rels.length, list: rels});
  })
}

function addMetoo_event(req, res){
  var cypher = "START event = node({event_id})"
             + "MATCH user -[:has_stage]-> stage -[:has_event]-> event "
             + "OPTIONAL MATCH x -[r:me_too]-> event "
             + "WHERE id(x) = {my_id} "
             + "RETURN user, r, x";

  db.query(cypher, {event_id: parseInt(req.params.event_id),my_id: parseInt(req.user.id)}, function(err, result){
    if (result[0].user.id == req.user.id) return res.status(401).json({success: false, error: 'cannot me-too own event'});
    if (err) return res.status(401).json({ success: false, error: err });
    if (result[0].x && result[0].x.id == req.user.id) return res.status(409).json({success: false, error: 'already me-too-ed the event', relationship: result[0].r});

    db.relate(req.user.id, 'me_too', req.params.event_id, function(err, rel){
      if (err) return res.status(401).json({ success: false, error: err });

      res.status(200).json({ success: true, relationship: rel});
    })
  })
}

function getEventMetoo(req, res){
  getMetooRel(req.params.event_id, 'in', req, res)
}

function deleteMetoo(req, res){
  db.rel.delete(req.params.metoo_id, function(err){
    if (err) return res.status(401).json({success: false, error: err});
    return res.status(200).json({ success: true })
  })
}

function getMetooRel(start, direction, req, res){
  db.relationships(start, direction, 'me_too', function(err, rels){
    if (err) return res.status(401).json({success: false, error: err.message})
    res.status(200).json({metoo_count: rels.length, list: rels});
  });
}

module.exports = {
  getMetooUsers : getMetooUsers,
  getEventMetoo : getEventMetoo,
  addMetoo_event: addMetoo_event,
  deleteMetoo   : deleteMetoo
}