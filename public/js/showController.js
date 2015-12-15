app.controller('ShowController', ['$scope','$http', '$window', '$state','$stateParams','$rootScope','$q','timelineHelper', ShowController]);

function ShowController($scope, $http, $window, $state, $stateParams, $rootScope, $q, timelineHelper){
  $scope.fav = {};
  $scope.error = null;
  fetchUser($stateParams.timeline_id);
  fetchFavourite($stateParams.timeline_id);
  init();
  $scope.miniprofile = {
    templateUrl: 'template/timeline/popover/miniprofile.html?bust=' + Math.random().toString(36).slice(2),
    title: 'Hello'
  }

  $scope.timelines = [];

  $scope.$watch('stage_list', function(){
    if ($scope.stage_list && !($scope.event_list)){
      $scope.stage_list.forEach(function(stage){
        fetchEvents(stage.id);
      })
    }
  });

  $scope.showLikeList = function(event_id){
    $scope.timelines.forEach(function(timeline, idx){
      var event_idx = _.findIndex(timeline.events, function(event){
        return event.event.id == event_id
      })
      if( event_idx !== -1 ){
        $scope.timelines[idx].events[event_idx].likes.list.forEach(function(user, index){
          timelineHelper.getUser(user.start).then(function(res){
            $scope.timelines[idx].events[event_idx].likes.list[index].user_detail = res.data.user;
          })
        })
        $scope.timelines[idx].events[event_idx].likes.fetched = true;
        $scope.timelines[idx].events[event_idx].likes.clicked = !$scope.timelines[idx].events[event_idx].likes.clicked;

      }
    })
  }

  $scope.showMetooList = function(event_id){
    $scope.timelines.forEach(function(timeline, idx){
      var event_idx = _.findIndex(timeline.events, function(event){
        return event.event.id == event_id
      })
      if( event_idx !== -1 ){
        $scope.timelines[idx].events[event_idx].metoo.list.forEach(function(user, index){
          timelineHelper.getUser(user.start).then(function(res){
            $scope.timelines[idx].events[event_idx].metoo.list[index].user_detail = res.data.user;
          })
        })
        $scope.timelines[idx].events[event_idx].metoo.fetched = true;
        $scope.timelines[idx].events[event_idx].metoo.clicked = !$scope.timelines[idx].events[event_idx].metoo.clicked;
      }
    })
  }

  $scope.clearError = function(){
    $scope.error = null;
  }

  $scope.postMetoo = function(event_id){
    timelineHelper.postMetoo(event_id).then(function(res){
      $scope.timelines.forEach(function(timeline, idx){
        var event_idx = _.findIndex(timeline.events, function(event){
          return event.event.id == event_id
        });
        if (event_idx !== -1){
          $scope.timelines[idx].events[event_idx].metoo.clicked = false;
          $scope.timelines[idx].events[event_idx].metoo.metoo_count += 1;
          $scope.timelines[idx].events[event_idx].metoo.list.push(res.data.relationship);
          $scope.timelines[idx].events[event_idx].metoo.byme = true;
        };
      })
    }, function(error){
      if (error.status == 3104){
        return timelineHelper.deleteMetoo(error.data.relationship.id).then(function(res){
          $scope.timelines.forEach(function(timeline, idx){
            var event_idx = _.findIndex(timeline.events, function(event){
              return event.event.id == event_id
            })
            if (event_idx !== -1){
              $scope.timelines[idx].events[event_idx].metoo.metoo_count -= 1;
              $scope.timelines[idx].events[event_idx].metoo.byme = false;
              $scope.timelines[idx].events[event_idx].metoo.list = _.filter($scope.timelines[idx].events[event_idx].metoo.list, function(elem){
                return elem.id !== error.data.relationship.id
              })
            }
          })
        })
      }
      $scope.error = ":( " + error.data.error
    })
  }

  $scope.postLike = function(event_id){
    $http.post("http://" + location.host + '/api/event/' + event_id + "/likes")
         .then(function(res){
          $scope.timelines.forEach(function(timeline, idx){
            var event_idx = _.findIndex(timeline.events, function(event){
              return event.event.id == event_id
            })
            if (event_idx !== -1){
              $scope.timelines[idx].events[event_idx].likes.clicked = false;
              $scope.timelines[idx].events[event_idx].likes.like_count += 1;
              $scope.timelines[idx].events[event_idx].likes.list.push(res.data.relationship);
              $scope.timelines[idx].events[event_idx].likes.byme = true;
            }
          })
         }, function(error){
          if (error.status == 3104){
            return timelineHelper.deleteLike(error.data.relationship.id).then(function(res){
                    $scope.timelines.forEach(function(timeline, idx){
                      var event_idx = _.findIndex(timeline.events, function(event){
                        return event.event.id == event_id
                      })
                      if (event_idx !== -1){
                        $scope.timelines[idx].events[event_idx].likes.like_count -= 1;
                        $scope.timelines[idx].events[event_idx].likes.byme = false;
                        $scope.timelines[idx].events[event_idx].likes.list = _.filter($scope.timelines[idx].events[event_idx].likes.list, function(elem){
                          return elem.id !== error.data.relationship.id
                        })
                      }
                    })
            })
          }
          $scope.error = ":( " + error.data.error
         })
  };

  $scope.favUser = function(){
    $http.post("http://" + location.host + '/api/timeline/' + $stateParams.timeline_id + "/favourites")
         .then(function(res){
          $scope.fav.users.push(res.data.relationship)
          $scope.fav.count += 1;
         }, function(error){
          if (error.status == 3104) {
            return timelineHelper.deleteFav(error.data.relationship.id).then(function(res){
              $scope.fav.users = _.filter($scope.fav.users, function(elem){
                return elem.id !== error.data.relationship.id
              })
              $scope.fav.count -= 1;
            }, function(error){
              $scope.error = error.data.error
            })
          }
          $scope.error = error.data.error
         })
  }

  function init(){
    $http.get("http://" + location.host + '/api/timeline/' + $stateParams.timeline_id + "/stages")
         .then(function(res){
          res.data.stages.forEach(function(stage){
            $scope.timelines.push({stage: stage, events: []})
          })
          $scope.timelines = _($scope.timelines).sortBy(function(timeline){
            return timeline.stage.start;
          })
          $scope.stage_list = res.data.stages;
          return res.data.stages
         }, function(error){
          $scope.error = error.data.error
         })
  }

  function fetchEvents(stage_id){
    $http.get("http://" + location.host + '/api/timeline/' + $stateParams.timeline_id + "/stage/" + stage_id + "/events")
         .then(function(res){
          _.each($scope.timelines, function(item, id){
            if (_.isEqual(item.stage.id, stage_id)){
              res.data.events.forEach(function(event){
                timelineHelper.getLike(event.id).then(function(res){
                  var input = {event: event, likes: res.data}
                  $scope.timelines[id].events.push(input);

                  var idx = $scope.timelines[id].events.length;
                  var ifLiked =  _.some(res.data.list, function(elem){
                    return elem.start == $window.sessionStorage.sid
                  })
                  if (ifLiked){ $scope.timelines[id].events[idx - 1].likes.byme = true };

                  timelineHelper.getMetoo(event.id).then(function(res){
                    $scope.timelines[id].events[idx - 1].metoo = res.data;
                    var ifMetoo =  _.some(res.data.list, function(elem){
                      return elem.start == $window.sessionStorage.sid
                    })
                    if (ifMetoo){ $scope.timelines[id].events[idx - 1].metoo.byme = true };
                  }, function(error){
                    $scope.error = error.data.error
                  })
                },function(error){
                    $scope.error = error.data.error
                  });
                })
            };
          });
         }, function(error){
          $scope.error = error.data.error
         });
  }

  function fetchFavourite(user_id){
    $http.get("http://" + location.host + '/api/timeline/' + user_id + "/favourites")
         .then(function(res){
          $scope.fav.users = res.data.fav_user;
          $scope.fav.count = res.data.fav_count;
         }, function(err){
          $scope.error = err.data.error || err.data.message;
         })
  }

  function fetchUser(user_id){
    $http.get("http://" + location.host + '/api/user/' + user_id)
         .then(function(res){
          $scope.user = res.data.user
         }, function(error){
          $scope.error = err.data.error || err.data.message;
         });
  }

  function fetchLike(event_id){
    var defer = $q.defer();
    $http.get("http://" + location.host + '/api/event/' + event_id + "/likes")
         .then(function(res){
          console.log(res.data)
          defer.resolve(res.data)
         }, function(error){
          $scope.error = err.data.error || err.data.message;
         });
    return defer.promises;
  }
}