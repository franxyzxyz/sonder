app.controller('UserController', ['$scope', '$http','$window', '$state','timelineHelper','$location', UserController]);

function UserController($scope, $http, $window, $state, timelineHelper, $location){
  console.log(location.host)
  $scope.currentUser = {};
  $scope.user = {username: null, password: null};
  $scope.newUser = {anonymous: false};
  $scope.message = null;
  $scope.error = null;
  $scope.token = $window.sessionStorage.token;
  $scope.edit = {};
  $scope.editUser = {};
  $scope.clearMessage = function(){
    $scope.message  = null;
  }
  getSignup();

  function getSignup(){
    $http
      .get("http://localhost:3000/api/helper/location")
      .success(function(data, status, headers, config){
        $scope.locationsList = data.location;
      })
    $http
      .get("http://localhost:3000/api/helper/industry")
      .success(function(data, status, headers, config){
        $scope.industryList = data.industry;
      });
  }

  if ($window.sessionStorage.token){
    getUser($window.sessionStorage.sid)
  }

  function getUser(user_id){
    $http
      .get('http://localhost:3000/api/user/' + user_id)
      .then(function(res){
        $scope.currentUser = res.data.user;
      })
  }

  $scope.postLogin = function(){
    $http
      .post('http://localhost:3000/api/login', $scope.user)
      .success(function(data, status, headers, config){
        $scope.user.username = null;
        $scope.user.password = null;
        $scope.currentUser = data.user;
        $window.sessionStorage.token = data.token;
        $window.sessionStorage.sid = data.user.id;
        $scope.token = $window.sessionStorage.token;
        $scope.message = 'Welcome! ' + $scope.currentUser.name;
      })
      .error(function(data, status, headers, config){
        delete $window.sessionStorage.token;
        $scope.error = data.message.toUpperCase();
      })
  };
  $scope.postSignup = function(){
    $http
      .post('http://localhost:3000/api/signup', $scope.newUser)
      .success(function(data, status, headers, config){
        $scope.message = 'User ' + data.user.name + ' has been created!';
        $state.go('login');
        $scope.newUser = {anonymous: false};
      })
      .error(function(data, status, headers, config){
        if (data.message.split(".")[0] == "Neo"){
          $scope.error = "EMAIL HAS BEEN TAKEN";
          $scope.newUser.email = "";
          $scope.newUser.password = "";
        }else{
          $scope.newUser = {};
          $scope.error = data.message.toUpperCase();
        }
      })
  }
  $scope.logout = function(){
    $scope.token = null;
    $scope.message = '';
    $scope.currentUser = null;
    $state.go('login');
    delete $window.sessionStorage.sid;
    delete $window.sessionStorage.token;
  }
  $scope.editSetting = function(field){
    for (prop in $scope.currentUser){
      $scope.editUser[prop] = $scope.currentUser[prop];
    }
    $scope.edit[field] = true
  }
  $scope.saveSetting = function(field){
    timelineHelper.updateUser($scope.editUser.id, $scope.editUser).then(function(res){
      console.log(res.data)
      $scope.currentUser = res.data.user;
      $scope.cancel(field)
    }, function(error){
      console.log(error.data)
    })
  }
  $scope.cancel = function(field){
    $scope.editUser[field] = $scope.currentUser[field];
    $scope.edit[field] = false
  }
}