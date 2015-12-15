app.controller('FavController', ['$scope','$http', '$window', '$state', '$stateParams', FavController]);

function FavController($scope, $http, $window, $state, $stateParams){
  // $scope.favourite = {users: []};
  fetchMyFavourite($stateParams.user_id)

  function fetchMyFavourite(user_id){
    $scope.favourite = {users: []};
    $http.get('http://localhost:3000/api/user/' + user_id + "/favourites")
         .then(function(res){
          $scope.favourite.count = res.data.fav_count;
          res.data.fav_user.forEach(function(user){
            fetchUser(user.end)
          })
         }, function(err){
          $scope.error = err.data.error || err.data.message;
         })
  }

  function fetchUser(user_id){
    $http.get('http://localhost:3000/api/user/' + user_id)
         .then(function(res){
          $scope.favourite.users.push(res.data.user)
         }, function(error){
          $scope.error = err.data.error || err.data.message;
         })
  }

}