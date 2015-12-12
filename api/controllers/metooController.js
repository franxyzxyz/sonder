var validation  = require('../helpers/validation')
var Q           = require("q");

function getMetooUsers(req, res){
  var cypher = "START user = node({id}) "
             + "MATCH user -[:has_stage]-> stage -[:has_event]-> event <-[r:metoo]- users "
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
  // db.relationships(req.params.event_id, 'all', 'has_event', function(err, rel){
  //   db.relationships(rel[0].start, 'all', 'has_stage', function(err, result){
  //     // console.log(result[0].start)
  //     // console.log(req.user.id)
  //     if(result[0].start == req.user.id){
  //       console.log('same user')
  //     }
  //   })
  // })
  var cypher = "START event = node({event_id}) "
             + "MATCH user -[r:has_stage]-> stage -[:has_event]-> event <-[:metoo]- me "
             + "WHERE id(me) = {id}"
             + "RETURN r, user"
  db.query(cypher, {id: parseInt(req.user.id), event_id: parseInt(req.params.event_id)}, function(err, result){
    console.log(result)

    /// user cannot me-too their own events

    // if (result.length !== 0) return res.status(401).json({success: false, error: 'already me-too-ed', relationship: result[0]});

    // db.relate(req.user.id, 'me_too', req.params.event_id, function(err, rel){
    //   res.status(200).json({ success: true, relationship: rel})
    // })
  })
}

function deleteMetoo(req, res){
  console.log(req.params.metoo_id)
  // db.rel.delete(req.params.metoo_id, function(err){
  //   if (err) return res.status(401).json({success: false, error: err});
  //   return res.status(200).json({ success: true })
  // })
}

function getMetooRel(start, direction, req, res){
  db.relationships(start, direction, 'metoo', function(err, rels){
    if (err) return res.status(401).json({success: false, error: err.message})
    res.status(200).json({metoo_count: rels.length, list: rels});
  });
}

module.exports = {
  getMetooUsers : getMetooUsers,
  addMetoo_event: addMetoo_event,
  deleteMetoo   : deleteMetoo
}