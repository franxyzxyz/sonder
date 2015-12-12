app.controller('UserController', ['$scope', '$http','$window', UserController]);

function UserController($scope, $http, $window){
  $scope.user = {username: null, password: null};
  $scope.message = '';
  $scope.submit = function(){
    $http
      .post('http://localhost:3000/api/login', $scope.user)
      .success(function(data, status, headers, config){
        $window.sessionStorage.token = data.token;
        $scope.message = 'Welcome!';
      })
      .error(function(data, status, headers, config){
        delete $window.sessionStorage.token;
        $scope.message = data.message
      })
  };
}