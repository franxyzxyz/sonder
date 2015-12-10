function getFavourites(req, res){
  getRelationship('in', req, res)
}

function addFavourite(req, res){
  var cypher = "START user = node({id})"
             + "MATCH user -[r:favourites]-> other "
             + "WHERE id(other) = {otherUser}"
             + "RETURN r";
  if (req.user.id == req.params.user_id) return res.status(401).json({success: false, error: 'cannot favourite yourself'});

  db.query(cypher, {id: parseInt(req.user.id), otherUser: parseInt(req.params.user_id)}, function(err, result){
    if (result.length !== 0) return res.status(401).json({success: false, error: 'already favourited', relationship: result[0]});
    db.relate(req.user.id, 'favourites', req.params.user_id, function(err, rel){
      res.status(200).json({ success: true, relationship: rel})
    })
  })
}

function deleteFavourite(req, res){
  db.rel.delete(req.params.favourite_id, function(err){
    if (err) return res.status(401).json({success: false, error: err});
    return res.status(200).json({ success: true })
  })
}

function getUserFavourites(req, res){
  getRelationship('out', req, res)
}

function getRelationship(direction, req, res){
  db.relationships(req.params.user_id, direction, 'favourites', function(err, rels){
    if (err) return res.status(401).json({success: false, error: err.message})
    res.status(200).json({fav_count: rels.length, fav_user: rels});
  });
}

module.exports = {
  getFavourites     : getFavourites,
  addFavourite      : addFavourite,
  deleteFavourite   : deleteFavourite,
  getUserFavourites : getUserFavourites
}
