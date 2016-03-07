app.controller('UserStateController', ['$scope', '$window',UserStateController]);

function UserStateController($scope, $window){
  $scope.token = $window.sessionStorage.token;
}
