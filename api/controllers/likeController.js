function getLikedEvents(req, res){
  getLikeRel(req.params.user_id, 'out', req, res)
}

function getEventLikes(req, res){
  getLikeRel(req.params.event_id, 'in', req, res)
}

function addLike(req, res){
  var cypher = "START user = node({id})"
             + "MATCH user -[r:likes]-> event "
             + "WHERE id(event) = {event_id}"
             + "RETURN r";
  db.query(cypher, {id: parseInt(req.user.id), event_id: parseInt(req.params.event_id)}, function(err, result){
    if (result.length !== 0) return res.status(401).json({success: false, error: 'already liked', relationship: result[0]});
    db.relate(req.user.id, 'likes', req.params.event_id, function(err, rel){
      res.status(200).json({ success: true, relationship: rel})
    })
  })
}

function deleteLike(req, res){
  db.rel.delete(req.params.like_id, function(err){
    if (err) return res.status(401).json({success: false, error: err});
    return res.status(200).json({ success: true })
  })
}

function getLikeRel(start, direction, req, res){
  db.relationships(start, direction, 'likes', function(err, rels){
    if (err) return res.status(401).json({success: false, error: err.message})
    res.status(200).json({like_count: rels.length, list: rels});
  });
}

module.exports = {
  getLikedEvents  : getLikedEvents,
  getEventLikes   : getEventLikes,
  addLike         : addLike,
  deleteLike      : deleteLike
}