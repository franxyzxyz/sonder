app.controller('PublicController', ['$scope','$http', '$window', '$state','$stateParams','$rootScope','$q','timelineHelper', PublicController]);

function PublicController($scope, $http, $window, $state, $stateParams, $rootScope, $q, timelineHelper){
  timelineHelper.browse().then(function(res){
    $scope.list = res.data.list
    var name_array = ['Man On a Wire','Girl on Fire','Woman in Gold','Boy Meets World']
    $scope.randomName = _.sample(name_array);
    var role_array = ['typing....','Wow now I\'m a graduate','since 1984'];
    $scope.randomRole = _.sample(role_array);

    timelineHelper.getHelper().then(function(res){
      $scope.locationList = res.data.location;
      $scope.industryList = res.data.industry;
      $scope.randomLocation = _.sample($scope.locationList);
      $scope.randomIndustry = _.sample($scope.industryList);
    })
  });
}