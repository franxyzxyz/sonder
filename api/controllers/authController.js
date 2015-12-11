function isUserAuthorized(req, res, next){
  var cypher = "START x = node({id})"
             + "RETURN x";
  dbQuery(req, res, next, cypher, {id: parseInt(req.params.user_id)})
}

function isStageAuthorized(req, res, next){
  var cypher = "START x = node({id})"
             + "MATCH n -[r:has_stage]-> x "
             + "RETURN n";
  dbQuery(req, res, next, cypher, {id: parseInt(req.params.stage_id)})
}

function isEventAuthorized(req, res, next){
  var cypher = "START x = node({id})"
             + "MATCH a -[b:has_stage]-> n -[r:has_event]-> x "
             + "RETURN a";
  var node_type = req.path.split("/")[1];
  var id_params = req.params[node_type + '_id'];
  dbQuery(req, res, next, cypher, {id: parseInt(id_params)})
}

function dbQuery(req, res, next, cypher, params){
  db.query(cypher, params, function(err, result){
    if (err) return res.status(401).json({error: err.message});
    if (result.length == 0) return res.status(401).json({error: 'Not a valid id'});
    if (result[0].username !== req.user.username) return res.status(401).json({success: false, error: 'Account not authorized for the action'});
    return next();
  })
}

function checkUserNode(req, res, next){
  db.readLabels(req.params.user_id, function(err, label){
    if (!label || label.indexOf('user') == -1) return res.status(401).json({success: false, error: 'Invalid user id'});
    return next();
  })
}

function checkStageNode(req, res, next){
  db.readLabels(req.params.stage_id, function(err, label){
    if (!label || label.indexOf('stage') == -1) return res.status(401).json({success: false, error: 'Invalid stage id'});
    return next();
  })
}

function checkEventNode(req, res, next){
  db.readLabels(req.params.event_id, function(err, label){
    if (!label || label.indexOf('event') == -1) return res.status(401).json({success: false, error: 'Invalid event id'});
    return next();
  })
}

function checkFavRel(req, res, next){
  db.rel.read(req.params.favourite_id, function(err, rel){
    if (!rel || rel.type !== 'favourites') return res.status(401).json({success: false, error: 'Invalid favourite id'});
    return userRelAuth(rel.start, req, res, next)
  })
}

function checkLikeRel(req, res, next){
  db.rel.read(req.params.like_id, function(err, rel){
    if (!rel || rel.type !== 'likes') return res.status(401).json({success: false, error: 'Invalid like id'});
    return userRelAuth(rel.start, req, res, next)
  })
}

function userRelAuth(id, req, res, next){
  var cypher = "START x = node({id})"
             + "RETURN x";
  dbQuery(req, res, next, cypher, {id: parseInt(id)})
}

module.exports = {
  isUserAuthorized  : isUserAuthorized,
  isStageAuthorized : isStageAuthorized,
  isEventAuthorized : isEventAuthorized,
  checkUserNode     : checkUserNode,
  checkStageNode    : checkStageNode,
  checkEventNode    : checkEventNode,
  checkFavRel       : checkFavRel,
  checkLikeRel      : checkLikeRel
}