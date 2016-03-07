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
    updateEvent: function(event_id, event_body){
      return $http.put("http://" + location.host + '/api/timeline/event/' + event_id, event_body)
    },
    getHelper: function(){
      return $http.get("http://" + location.host + '/api/helper/all')
    },
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
    },
    getExplore: function(){
      return $http.get("http://" + location.host + '/api/timelines')
    },
    getFav: function(user_id){
      return $http.get("http://" + location.host + '/api/user/' + user_id + "/favourites")
    },
    getUserLikes: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/' + user_id + "/likes")
    },
    getMetooBy: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/' + user_id + "/metoo")
    },
    getLikeDetail: function(like_id){
      return $http.get("http://" + location.host + '/api/timeline/like/' + like_id)
    },
    getLikedBy: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/' + user_id + "/likedby")
    },
    getFavBy: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/' + user_id + "/favourites")
    },
    getRecommend: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/recommend/' + user_id)
    },
    getFavRec: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/recommend/' + user_id + "/fav")
    },
    getRandom: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/recommend/' + user_id + "/random")
    },
    browse: function(){
      return $http.get("http://" + location.host + '/browse')
    },
    curatedMetoo: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/explore/' + user_id + "/metoo")
    },
    curatedFav: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/explore/' + user_id + "/fav")
    },
    curatedLike: function(user_id){
      return $http.get("http://" + location.host + '/api/timeline/explore/' + user_id + "/like")
    },
    searchBy: function(type, sort_type){
      return $http.get("http://" + location.host + '/api/timeline/search_by/' + type + '/' + sort_type)
    },
    searchKey: function(query_string){
      return $http.get("http://" + location.host + '/api/timeline/search/keywords?q=' + query_string)
    },
    getEvents: function(timeline_id, stage_id){
      return $http.get("http://" + location.host + '/api/timeline/' + timeline_id + "/stage/" + stage_id + "/events")
    },
    getStage: function(timeline_id){
      return $http.get("http://" + location.host + '/api/timeline/' + timeline_id + "/stages")
    }

  }
});
