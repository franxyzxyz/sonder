var Q           = require("q");
var _           = require('underscore');

function getTimelines(req, res){
  Q.nfcall(findMetoo, req.user.id, req.user.id)
   .then(function(result){
    if (result.length == 0){
      /// find by location or random
      return Q.nfcall(randomFetch, req.user.id)
              .then(function(value){
                return Q.nfcall(fetchUsers, value)
                        .then(function(result){
                          res.status(200).json({success: true, list: result, random: true})
                        })
              })
              .catch(function(error){
                res.status(401).json({success:false, error:error})
              })
    }
    return Q.nfcall(genArray,result, 'metoo')
            .then(function(data){
              return Q.nfcall(detailFav, req.user.id)
                      .then(function(data_result){
                        Q.nfcall(genArray, data_result, 'fav')
                         .then(function(value){
                          var outcome = _.chain(data.concat(value))
                                        .uniq(function(item, key, id){
                                          return item.user.id
                                        }).value();
                          res.status(200).json({success: true, list: outcome})
                         })
                         .catch(function(error){
                          console.log(error)
                         })
                      })
             })
            .catch(function(error){
              res.status(401).json({success: false, error: error})
             })
   })
}

function getFavRec(req, res){
  Q.nfcall(detailFav, req.user.id)
    .then(function(data_result){
      Q.nfcall(genArray, data_result, 'fav')
       .then(function(value){
        var outcome = _.chain(data.concat(value))
                      .uniq(function(item, key, id){
                        return item.user.id
                      }).value();
        res.status(200).json({success: true, list: outcome})
       })
       .catch(function(error){
        console.log(error)
       })
    })
}

function getSuggestions(req, res){
  Q.nfcall(lineMetoo, req.params.user_id)
   .then(function(result){
    return Q.nfcall(lineFav, req.params.user_id)
     .then(function(data){
      var fav_valid = _.some(data, function(elem){
        return !elem
      });
      var metoo_valid = _.some(result, function(elem){
        return !elem
      });
      if(!metoo_valid){
        var fav_list = _.uniq(result.concat(data), function(item, key, id){
          return item.id
        });
      }else if (!fav_valid){
        var fav_list = _.uniq(data, function(item, key, id){
          return item.id;
        })
      }else{
        fav_valid = []
      }
      res.status(200).json({success: true, list: fav_list})
     })
   })
   .catch(function(error){
    res.status(401).json({success: false, error: error})
   })
}

function fetchUsers(input, callback){
  var deliverables = [];
    input.forEach(function(user, idx){
      return Q.nfcall(fetchUser, user.id)
              .then(function(res){
                deliverables.push(res)
                if (deliverables.length == input.length){
                  return callback(null, deliverables)
                }
              })
              .catch(function(error){
                console.log(error)
              });
    });
}

function fetchUser(user_id, callback){
  var user_cypher = "START user = node({id})"
                  + "MATCH (user)"
                  + "OPTIONAL MATCH (user) -[:has_stage]-> (stage)"
                  + "OPTIONAL MATCH (user) -[:has_stage]-> () -[:has_event]-> (event)"
                  // + "OPTIONAL MATCH (user) -[:has_stage]-> (stage) -[:has_event] -> (event)"
                  + "RETURN user, stage, event"
  db.query(user_cypher, {id: parseInt(user_id)}, function(err, result){
    if (result.length > 1){
      var res = {};
      res.stage = _.chain(result).pluck('stage').uniq(function(item, key, id){
        return item.id
      }).flatten().value();
      res.event = _.chain(result).pluck('event').uniq(function(item, key, id){
        return item.id
      }).flatten().value();
      res.user = _.chain(result).pluck('user').uniq(function(item, key, id){
        return item.id
      }).flatten().value()[0];
      delete res.user.password; delete res.user.username;
      return callback(null, res)
    }
    var res = {stage:[],event:[]};
    if (result[0].stage){
      res.stage.push(result[0].stage)
    }else{
      res.stage = null;
    }
    if (result[0].event){
      res.event.push(result[0].event)
    }else{
      res.event = null;
    }
    res.user = result[0].user;
    delete res.user.password
    delete res.user.username
    return callback(null, res)
  })
}

function randomFetch(user_id, callback){
    var cypher = "MATCH (n:user)"
               + "WHERE id(n) <> {id}"
               + "RETURN n" ;
  db.query(cypher, {id: parseInt(user_id)}, function(err, result){
    if(err){console.log(err)}
    return callback(null, result)
  })
}


function findMetoo(user_id, origin_id, callback){
  var metoo_cypher = "START user = node({id})"
             + "MATCH (user) -[r:me_too]-> (event)"
             + "OPTIONAL MATCH (event) <-[:has_event]- () <-- (origin)"
             + "OPTIONAL MATCH (event) <-[:me_too]- (target)"
             + "WHERE id(target) <> {origin_id}"
             + "RETURN origin, r, target" ;
  db.query(metoo_cypher, {id: parseInt(user_id),origin_id:parseInt(origin_id)}, function(err, result){
    return callback(null, result)
  })
}

function genArray(result, method, callback){
  var origin_list = _.chain(result)
                      .pluck('origin')
                      .pluck('id')
                      .uniq()
                      .value();
  var target_list  = _.chain(result)
                      .pluck('target')
                      .pluck('id')
                      .uniq()
                      .value();
  var iterate = _.difference( target_list,origin_list);
  var result_list = []
  iterate.forEach(function(num){
    result_list.push(_.find(result, function(elem){
      return elem.target.id == num
    }))
  })
  var input = _.chain(result_list).pluck('target').uniq(function(item, key, id){
    return item.id;
  }).value();
  Q.nfcall(fetchUsers, input)
   .then(function(resp){
    resp = _.each(resp, function(elem){
      elem[method] = true
    });
    return callback(null, resp);
   })
   .catch(function(error){
      return callback(error);
   })
}
function getRandom(req, res){
  if(!req.params.user_id){
    var user_id = Math.random()*1000;
  }else{
    var user_id = req.params.user_id;
  }
  console.log(user_id)
   Q.nfcall(randomFetch, user_id)
    .then(function(value){
      return Q.nfcall(fetchUsers, value)
              .then(function(result){
                result = _.each(result,function(elem){
                  elem.random = true
                })
                res.status(200).json({success: true, list: result})
              })
    })
    .catch(function(error){
      res.status(401).json({success:false, error:error})
    })
}

function lineMetoo(user_id, callback){
  var metoo_cypher = "START user = node({id})"
             + "MATCH (user) -[:has_stage]-> () -[:has_event]-> (event)"
             + "OPTIONAL MATCH (event) <-[r:me_too]-> (target)"
             + "RETURN target" ;
  db.query(metoo_cypher, {id: parseInt(user_id)}, function(err, result){
    return callback(null, result)
  })
}

function lineFav(user_id, callback){
  var fav_cypher = "START user = node({id})"
             + "MATCH (user) -[:favourites]- (target)"
             + "RETURN target" ;
  db.query(fav_cypher, {id: parseInt(user_id)}, function(err, result){
    if (err){console.log(err)}
    return callback(null, result)
  })
}

function detailFav(user_id, callback){
  var fav_cypher = "START user = node({id})"
             + "MATCH (user) -[:favourites*1..2]- (target)"
             + "OPTIONAL MATCH (target) -[:has_stage]-> (stage) -[:has_event]-> (event)"
             + "RETURN target, stage, event" ;
  db.query(fav_cypher, {id: parseInt(user_id)}, function(err, result){
    if (err){console.log(err)}
    return callback(null, result)
  })
}

function furFav(user_id, callback){
  var fav_cypher = "START user = node({id})"
             + "MATCH (user) -[:favourites*1..2]- (target)"
             + "RETURN target" ;
  db.query(fav_cypher, {id: parseInt(user_id)}, function(err, result){
    if (err){console.log(err)}
    return callback(null, result)
  })
}

function spreadMetoo(array_user, callback){
}

function getTimeline(req, res){
  console.log('in timeline')
}

module.exports = {
  getTimelines : getTimelines,
  getTimeline  : getTimeline,
  getSuggestions : getSuggestions,
  getFavRec     : getFavRec,
  getRandom   : getRandom
}