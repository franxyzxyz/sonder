var app = angular.module('sonder',['ui.router','ui.bootstrap','ngResource','ui.gravatar','ngJoyRide'])
                 .config(authRoute);

function authRoute($httpProvider, $stateProvider, $urlRouterProvider){
  $httpProvider.interceptors.push('authInterceptor');

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: "/",
      templateUrl: "template/login.html"
    })
    .state('landing',{
      url: "/explore",
      templateUrl: "template/explore.html"
    })
    .state('login', {
      url: "/login?:login",
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
              .get("http://" + location.host + '/api/timeline/' + $window.sessionStorage.sid + "/stages")
              .success(function(data, status, headers, config){
                $scope.timelines = [];
                return data.stages.forEach(function(stage){
                  var input = {stage: stage, event: []};
                  $http.get("http://" + location.host + '/api/timeline/' + $window.sessionStorage.sid + "/stage/" + stage.id + "/events")
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
    })
    .state('addStage', {
      url: "/timeline/addStage",
      templateUrl: "template/timeline/addStage.html"
    })
    .state('showOne',{
      url: "/timeline/show/:timeline_id",
      templateUrl: "template/timeline/show.html",
      controller: function($window, $state){
        if (!$window.sessionStorage.sid){
          return $state.go('login',{'login':'Oops. You have to login first :D '});
        }
      }
    })
    .state('favList',{
      url: "/timeline/my-favourites/:user_id",
      templateUrl: "template/timeline/favourite.html"
    })
    .state('about',{
      url: "/about",
      templateUrl: "template/about.html"
    })
    .state('browse',{
      url: "/browse",
      templateUrl: "template/browse.html"
    })

}

function checkAuth($q, $window, $state, $location){
  console.log($window.sessionStorage.sid)
  if (!$window.sessionStorage.sid){
    return $location.path('/login?o=test');
  }
}