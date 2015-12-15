app.factory('authInterceptor', function($rootScope, $q, $window){
  return {
    request: function (config){
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401) {
        // handle the case where the user is not authenticated
        console.log('oops')
      }
      return response || $q.when(response);
    }
  }
});

app.factory('timelineHelper', function($http, $q){
  return {
    getLike: function(event_id){
      return $http.get("http://" + location.host + '/api/event/' + event_id + "/likes")
    },
    deleteFav: function(fav_id){
      return $http.delete("http://" + location.host + '/api/timeline/favourite/' + fav_id)
    },
    deleteLike: function(like_id){
      return $http.delete("http://" + location.host + '/api/timeline/like/' + like_id)
    },
    getUser: function(user_id){
      return $http.get("http://" + location.host + '/api/user/' + user_id)
    },
    getMetoo: function(event_id){
      return $http.get("http://" + location.host + '/api/event/' + event_id + "/metoo")
    },
    postMetoo: function(event_id){
      return $http.post("http://" + location.host + '/api/event/' + event_id + "/metoo")
    },
    deleteMetoo: function(metoo_id){
      return $http.delete("http://" + location.host + '/api/timeline/metoo/' + metoo_id)
    },
    updateUser: function(user_id, newBody){
      return $http.put("http://" + location.host + '/api/user/' + user_id, newBody)
    }
  }
});