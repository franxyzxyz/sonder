app.controller('TimelineController', ['$scope','$http', '$window', '$state','$stateParams', '$rootScope', TimelineController]);

function TimelineController($scope, $http, $window, $state, $stateParams, $rootScope){
  init_form();
  $scope.newEvent = {tag: "", description: "", to_stage:{}};
  $scope.newStage = {};
  $scope.inPost = false;
  $scope.collapse = false;
  $scope.specific_stage = null;

  $scope.$watch('newEvent.to_stage.id', function(){
    if ($scope.stages && !$scope.inPost){
      $scope.stages.forEach(function(stage){
        if (stage.id == $scope.newEvent.to_stage.id){
          $scope.newEvent.to_stage.start = stage.start;
          $scope.newEvent.to_stage.end = stage.end;
        }
      })
    }
  })

  $scope.$watch('specific_stage', function(){
    $scope.newEvent.to_stage.id = $scope.specific_stage
  })

  $scope.addEvent = function(){
    if ($window.sessionStorage.sid){
      $scope.inPost = true;
      $scope.eventMessage = null;
      var stage_id = $scope.newEvent.to_stage.id;
      delete $scope.newEvent.to_stage
      $http
        .post("http://" + location.host + "/api/timeline/" + $window.sessionStorage.sid + "/stage/" + stage_id + "/events", $scope.newEvent)
        .success(function(data, status, headers, config){
          $state.go('editTimeline');
          if ($scope.reset){
            $scope.reset();
          }
        })
        .error(function(data, status, headers, config){
          console.log(data)
          $scope.stageMessage = data.message.toUpperCase();
        });
    }
  }

  $scope.deleteEvent = function(event_id){
    $http
      .delete("http://" + location.host + "/api/timeline/event/" + event_id)
      .then(function(res){
        $scope.reset();
      }, function(error){
        console.log(error)
        $scope.error = error.data
      })
  }

  $scope.addStage = function(){
    if ($window.sessionStorage.sid){
      $scope.stageMessage = null;
      $http
        .post("http://" + location.host + "/api/timeline/" + $window.sessionStorage.sid + "/stages", $scope.newStage)
        .success(function(data, status, headers, config){
          $scope.reset();
          $state.go('editTimeline');
        })
        .error(function(data, status, headers, config){
          $scope.stageMessage = data.message.toUpperCase();
        });
    }
  }

  $scope.clearMessage = function (){
    $scope.message = null;
  }

  $rootScope.$on('add_to_stage', function(e, stage_id){
    console.log(stage_id)
    $scope.specific_stage = stage_id;
  })

  $rootScope.$on('deleted_stage', function(event, stage_id){
    $scope.message = "Successfully deleted the stage!";
    var target = _.find($scope.timelines, function(stage){
      return stage.stage.id == stage_id
    });
    if (target && target.event.length !== 0){
      target.event.forEach(function(event){
        $scope.deleteEvent(event.id)
      })
    }
    $scope.timelines = _.filter($scope.timelines, function(stage){
      return stage.stage.id !== stage_id
    })
  })

  function init_form(){
    if ($window.sessionStorage.sid){
      $http
        .get("http://" + location.host + "/api/helper/category")
        .success(function(data, status, headers, config){
          $scope.categoryList = data.category;
        });
      $http
        .get("http://" + location.host + "/api/timeline/" + $window.sessionStorage.sid + "/stages")
        .success(function(data, status, headers, config){
          if (data.no_of_stages == 0) {$scope.eventMessage = 'It seems like you haven\'t add any stage yet'}
          $scope.stages = data.stages;
          $scope.specific_stage = $stateParams.stage;
          if ($scope.specific_stage){ $scope.newEvent.to_stage.id = $scope.specific_stage; }
        })
    }
  }
}