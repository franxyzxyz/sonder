app.controller('GraphController', ['$scope','$stateParams','timelineHelper', GraphController]);

function GraphController($scope, $stateParams, timelineHelper){
  // $scope.stages = {};

  timelineHelper.getStage($stateParams.timeline_id)
    .then(function(stage_result){
      // console.log(stage_result.data.stages)
      $scope.stages = stage_result.data.stages
    })
}