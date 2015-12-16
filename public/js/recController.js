app.controller('RecommendController', ['$scope','$http', '$window', '$state','$stateParams','$rootScope','$q','timelineHelper', RecommendController]);

function RecommendController($scope, $http, $window, $state, $stateParams, $rootScope, $q, timelineHelper){
  $scope.owner = $stateParams.timeline_id;

  timelineHelper.getRecommend($stateParams.timeline_id).then(function(res){
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
};