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
    return Q.nfcall(genArray, result, 'metoo')
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

function getCurated_metoo(req,res){
  Q.nfcall(findMetoo, req.params.user_id, req.params.user_id)
   .then(function(metoo_result){
    if(_.isEmpty(metoo_result)) return res.status(401).json({success:false, list:[]});
    var metoo_input = _.chain(metoo_result)
                       .filter(function(elem){
                        return !!elem
                       })
                       .each(function(metoo){
                         metoo.method = 'metoo'
                       })
                       .value();
    return Q.nfcall(genResult, metoo_input)
            .then(function(curate_list){
              res.status(200).json({success:true, list: curate_list})
            })
   });
}

function getCurated_fav(req, res){
  Q.nfcall(favSearch, req.params.user_id)
   .then(function(fav_res){
    if(_.isEmpty(fav_res)) return res.status(401).json({success:false, list:[]});
    var fav_input = _.each(fav_res, function(fav){
     fav.method = 'fav' });
    return Q.nfcall(genResult, fav_input)
            .then(function(curate_list){
              res.status(200).json({success:true, list: curate_list})
            });
    });
}

function getCurated_like(req, res){
  Q.nfcall(likeSearch, req.params.user_id)
   .then(function(like_result){
    if(_.isEmpty(like_result)) return res.status(401).json({success:false, list:[]});
     var like_input = _.chain(like_result)
                       .filter(function(elem){
                        return !!elem
                       })
                       .each(function(like){
                         if (like){ like.method = 'like' }
                       })
                       .value();
    return Q.nfcall(genResult, like_input)
            .then(function(curate_list){
              res.status(200).json({success:true, list: curate_list})
            })
   })
}

function genResult(input, callback){
  var del = [];
  var input = _.chain(input)
               .uniq(function(item, key, id){
                return item.id
               })
               .each(function(elem){
                delete elem.password
               }).value();
  // var input = _.uniq(input, function(item, key, id){return item.id});
  return Q.nfcall(fetchUsers, input)
          .then(function(value){
            _.each(value,function(result){
              del.push(result)
            });
            return callback(null, del)
          })
}

function searchBy(req, res){
  Q.nfcall(searchQuery, req.params.type, req.params.sort_type)
   .then(function(result){
    res.status(200).json({success: true, list: result})
   })
}

function searchKey(req, res){
  Q.nfcall(keyword_search, req.query.q)
   .then(function(result){
    if (_.isEmpty(result)) return res.status(200).json({success:true, list:result});

     return Q.nfcall(getOrigin, result)
             .then(function(list){
              res.status(200).json({success: true, list: list})

             })
   })
   .catch(function(err){
    console.log(err)
   })
}

function getOrigin(list, callback){
  _.each(list, function(data, idx){
    return Q.nfcall(nodeOrigin, data.type[0], data.node.id)
            .then(function(user){
              list[idx].user = user[0];
              if (_.every(list, function(elem){
                return !!elem.user
              })){
                callback(null, list)
              }
            })
  })
}

function nodeOrigin(node_type, node_id, callback){
  var search = "START n = node({id})";
  switch(node_type){
    case 'event':
      search += "MATCH n <-[:has_event]- () <-[:has_stage]- (target)"
      break;
    case 'stage':
      search += "MATCH n <-[:has_stage]- (target)"
      break;
  }
  search += "RETURN target";
  db.query(search, {id: node_id}, function(err, result){
    result = _.each(result,function(elem){
      delete elem.password
    });
    return callback(null, result)
  })
}

function keyword_search(query_string, callback){
  var search_cypher = "MATCH (n)"
                    + "WHERE n.title =~ {string} OR n.description =~ {string}"
                    + "RETURN n as node, labels(n) as type";
  db.query(search_cypher, {string: ".*(?i)" + query_string + ".*"}, function(err, result){
    return callback(null, result)
  })
}

function searchQuery(type, sort_type, callback){
  var search_cypher = "MATCH (e) ";
  switch(type){
    case 'event':
      search_cypher += "MATCH (e) <-[:has_event]- () <-[:has_stage]- (user)"
      break;
  }
  search_cypher += "WHERE {type} in labels(e) AND e.event_type = {sort_type}"
                 + "RETURN e, user" ;
  db.query(search_cypher, {type: type, sort_type: sort_type}, function(err, result){
    result = _.each(result,function(elem){
      delete elem.user.password
    });
    return callback(null, result)
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
                if (user.method){
                  res.method = user.method;
                }
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
             // + "OPTIONAL MATCH (event) <-[:has_event]- () <-- (origin)"
             + "OPTIONAL MATCH (event) <-[:me_too]- (target)"
             + "WHERE id(target) <> {origin_id}"
             + "RETURN target" ;
  db.query(metoo_cypher, {id: parseInt(user_id),origin_id:parseInt(origin_id)}, function(err, result){
    result = _.chain(result).filter(function(elem){ return !!elem}).value()
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
                      .filter(function(elem){
                        return !!elem  == true
                      })
                      .pluck('id')
                      .uniq()
                      .value();
  console.log(origin_list, target_list)
  var iterate = _.difference( target_list ,origin_list);
  // console.log(iterate)
  var result_list = []
  console.log(result)
  iterate.forEach(function(num){
    //  _.each(result, function(elem){
    //   if (elem.target){
    //     result_list.push(elem.target)
    //   }
    // })
    result_list.push(_.find(result, function(elem){
      if (elem.target.id)
      return !!elem.target.id && elem.target.id == num
    }))
  })
  var input = result_list;
  // var input = _.chain(result_list).pluck('target').uniq(function(item, key, id){
    // return item.id;
  // }).value();
  // console.log(input)

  if (input.length == 0) return callback(null, []);

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

function favSearch(user_id, callback){
  var fav_cypher = "START user = node({id})"
             + "MATCH (user) -[:favourites*1..2]- (target)"
             + "WHERE id(target) <> {id}"
             + "RETURN target" ;
  db.query(fav_cypher, {id: parseInt(user_id)}, function(err, result){
    if (err){console.log(err)}
    return callback(null, result)
  })
}

function likeSearch(user_id, callback){
  var like_cypher = "START user = node({id})"
             + "MATCH (user) -[:likes]-> (event)"
             + "OPTIONAL MATCH (event) <-[:likes]- (origin) -[:likes]-> () <-[:has_event]- () <-[:has_stage]- (target)"
             + "WHERE id(target) <> {id} AND id(target) <> id(origin)"
             + "RETURN DISTINCT target" ;
  db.query(like_cypher, {id: parseInt(user_id)}, function(err, result){
    if (err){console.log(err)}
    return callback(null, result)
  })
}

module.exports = {
  getTimelines : getTimelines,
  getSuggestions : getSuggestions,
  getFavRec     : getFavRec,
  getRandom   : getRandom,
  getCurated_metoo  : getCurated_metoo,
  getCurated_fav : getCurated_fav,
  getCurated_like : getCurated_like,
  searchBy : searchBy,
  searchKey : searchKey
}