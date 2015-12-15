var app = angular.module('sonder',['ui.router','ui.bootstrap','ngResource','ui.gravatar'])
                 .config(authRoute);

function authRoute($httpProvider, $stateProvider, $urlRouterProvider){
  $httpProvider.interceptors.push('authInterceptor');

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "template/login.html"
    })
    .state('login', {
      url: "/login",
      templateUrl: "template/login.html"
    })
    .state('signup', {
      url: "/signup",
      templateUrl: "template/signup.html",
    })
    .state('profile', {
      url: "/my-profile",
      templateUrl: "template/profile.html"
    })
    .state('editTimeline',{
      url: "/timeline/edit",
      templateUrl: "template/timeline/edit.html",
      controller: function($scope, $http, $window){
        $scope.reset = function(){
          if ($window.sessionStorage.sid){
            $http
              .get('http://localhost:3000/api/timeline/' + $window.sessionStorage.sid + "/stages")
              .success(function(data, status, headers, config){
                $scope.timelines = [];
                return data.stages.forEach(function(stage){
                  var input = {stage: stage, event: []};
                  $http.get('http://localhost:3000/api/timeline/' + $window.sessionStorage.sid + "/stage/" + stage.id + "/events")
                       .success(function(data, status, headers, config){
                        data.events.forEach(function(event){
                          input.event.push(event)
                        });
                        $scope.timelines.push(input);
                        $scope.timelines = _($scope.timelines).sortBy(function(timeline){
                          return timeline.stage.start;
                        })
                        return $scope.timelines
                       });
                })
              });

          }
        }
        $scope.reset();
      }
    })
    .state('addEvent', {
      url: "/timeline/addEvent?stage",
      templateUrl: "template/timeline/addEvent.html"
      // controller: function($scope, $stateParams){
      //   $scope.specific_stage = $stateParams.stage;
      //   $scope.newEvent.to_stage = {};
      //   $scope.newEvent.to_stage.id = $stateParams.stage;
      // }
      // }
    })
    .state('addStage', {
      url: "/timeline/addStage",
      templateUrl: "template/timeline/addStage.html"
    })
    .state('showOne',{
      url: "/timeline/show/:timeline_id",
      templateUrl: "template/timeline/show.html",
      // controller : 'ShowController'
    })
    .state('favList',{
      url: "/timeline/my-favourites/:user_id",
      templateUrl: "template/timeline/favourite.html"
      // controller : 'FavController'
    })
    // .state('specific',{
    //   url:  "/timeline/addEvent/specific?stage",
    //   templateUrl: "template/timeline/addEvent.html",
    //   controller: function($scope, $stateParams) {
    //        $scope.specific_stage = $stateParams.stage;
    //        console.log($scope.specific_stage)
    //     }
    // })
    // .state('timeline',{
    //   url: "/timeline",
    //   templateUrl: "template/timeline.html",
    //   resolve: {
    //     promiseObj: function($http){
    //       console.log('in promise')
    //       return $http({method:'GET', url: 'http://localhost:3000/api'})
    //     }
    //   },
    //   controller: 'TimelineController'
    // })
}