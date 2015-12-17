app.controller('ExploreCtrl', ['$scope','$http', '$window', '$state','$stateParams','$rootScope','$q','timelineHelper', ExploreCtrl]);

function ExploreCtrl($scope, $http, $window, $state, $stateParams, $rootScope, $q, timelineHelper){
  $scope.me = $window.sessionStorage.sid;
  $scope.fetchLiked = false;
  var count = 0;
  $scope.startJoyRide = false;
  $scope.start = function(){
    $scope.startJoyRide = true;
    count ++;
  }
  $scope.config = [{
                type: "title",
                heading: "Welcome to SONDER",
                text: '<div class="row"><div id="title-text" class="col-md-12">This will walk you through the features of SONDER!</span></div></div>'

            },
    {
      type: "element",
      selector: "#step1",
      heading: "Your Profile",
      text: "Profile of yours",
      placement: "right",
    },
    {
      type: "element",
      selector: "#step2",
      heading: "Some of the stats",
      text: "Showing the figures of whom 'me-too'/'liked'/'favourite' your story!",
      placement: "bottom",
    },
    {
      type: "element",
      selector: "#step3",
      heading: "Other stories",
      text: "You can read some of the details that described what kind of stories the person has",
      placement: "left",
    },{
                type: "title",
                heading: "Stages and Events",
                text: "<div class='row popover-row'>There are two major part which made up a 'timeline' for a person in Sonder: Stage and Event. <br/><br/> <strong>Stage</strong> describes a period of time in the person's life and <strong>Event</strong> describes a particular story in that stage.<br/><br/> e.g. The event 'Hated School and tried to ran away from school several times' might be inside a stage named 'Rebelliious Ages'.</div>"

            }
  ];
  $scope.likedby = function(){
    $scope.fetchLiked = !$scope.fetchLiked;
    $scope.fetchFav = false;
    $scope.fetchMetoo = false;
  }

  $scope.favby = function(){
    $scope.fetchFav = !$scope.fetchFav;
    $scope.fetchLiked = false;
    $scope.fetchMetoo = false;
  }
  $scope.metooby = function(){
    $scope.fetchMetoo = !$scope.fetchMetoo;
    $scope.fetchLiked = false;
    $scope.fetchFav = false;
  }

  timelineHelper.getRecommend($window.sessionStorage.sid).then(function(res){
    $scope.recommend = res.data.list;
    res.data.list.forEach(function(data){
      timelineHelper.getRecommend(data.id).then(function(sec_layer){
        $scope.recommend = _.chain($scope.recommend)
                    .concat(sec_layer.data.list)
                    .uniq(function(i,k,id){
                      return i.id
                     })
                    .each(function(elem){
                      delete elem.username;
                      delete elem.password;
                    }).value();
      })
    })

  });

  timelineHelper.getUser($window.sessionStorage.sid).then(function(res){
    $scope.user.info = res.data.user
  })

  timelineHelper.getExplore().then(function(res){
    $scope.exploreMetoo = res.data.list;
    $scope.exploreMetoo = _.shuffle($scope.exploreMetoo)
    $scope.exploreMetoo = _.chain($scope.exploreMetoo)
                           .uniq(function(item, key, id){
                            return item.user.id
                           }).value();
    timelineHelper.getRandom($window.sessionStorage.sid).then(function(data){
      var existing = _.chain($scope.exploreMetoo)
                      .pluck('user')
                      .pluck('id').value();
      _.each(data.data.list, function(elem){
        if (existing.indexOf(elem.user.id) == -1 && elem.user.id !== $scope.me){
          if ($scope.exploreMetoo.length <= 10){
            $scope.exploreMetoo.unshift(elem)
          }else{
            $scope.exploreMetoo.push(elem)
          }
        }
      });
      // $scope.exploreMetoo = _.shuffle($scope.exploreMetoo);
    })
  })

  timelineHelper.getFav($window.sessionStorage.sid).then(function(res){
    $scope.user.fav = res.data
  })
  $scope.user.faved = [];
  $scope.user.metoolist = [];
  timelineHelper.getFavBy($window.sessionStorage.sid).then(function(res){
    res.data.fav_user.forEach(function(elem){
      timelineHelper.getUser(elem.start).then(function(res){
        $scope.user.faved.push(res.data.user)
      })
    })

  })
  timelineHelper.getUserLikes($window.sessionStorage.sid).then(function(res){
    $scope.user.likes = res.data
  })

  timelineHelper.getLikedBy($window.sessionStorage.sid).then(function(res){
    $scope.user.likedby = res.data
    $scope.user.likeUnique = _.chain(res.data.list)
                              .pluck('users')
                              .uniq(function(item, key, id){
                                return item.id
                              }).value();
  })

  timelineHelper.getMetooBy($window.sessionStorage.sid).then(function(res){
    $scope.user.metooby = res.data
    res.data.list.forEach(function(elem){
      timelineHelper.getUser(elem.user_id).then(function(res){
        $scope.user.metoolist.push(res.data.user)
      })
    })
  })}
