app.controller('SearchController', ['$scope','$http', '$window', '$state','$stateParams','$rootScope','$q','timelineHelper', SearchController]);

function SearchController($scope, $http, $window, $state, $stateParams, $rootScope, $q, timelineHelper){
  switch($state.current.name){
    case 'searchBy':
      $scope.result = {};
      $scope.search_title = {
        'type' : $stateParams.type.toUpperCase(),
        'sort_type' : $stateParams.sort_type.toUpperCase()
      }
      timelineHelper.searchBy($stateParams.type, $stateParams.sort_type).then(function(res){
        $scope.result.count = res.data.list.length;
        $scope.result.list = res.data.list;
      })
      break;
    case 'searchKey':
      $scope.search_string;
      $scope.filter_list = {};
      $scope.filter_query = {};
      $scope.clicked = {'event':true, 'stage':true};
      break;
  }

  $scope.filter_array = function(value, index){
    return !_.isEmpty(_.intersection($scope.filter_query.type, value.type))
  }

  $scope.filtering = function(node_type){
    if (!$scope.clicked[node_type]){
      if(!_.contains($scope.filter_query.type, node_type)){
        $scope.filter_query.type.push(node_type)
      }
    }else{
      $scope.filter_query.type = _.without($scope.filter_query.type, node_type)
    }
    $scope.clicked[node_type] = !$scope.clicked[node_type];
  }

  $scope.filter_event_list = function(value, index){
    if (value.type.indexOf('event') != -1){
      return _.contains($scope.filter_query.event, value.node.event_type)
    }else{
      return true
    }
  }

  $scope.filter_event = function(event_type){
    if (!event_type){
      _.each($scope.filter_query.event, function(ev){
        $scope.clicked[ev] = false;
      });
      $scope.filter_query.event = [];
    }else if(event_type == 'all'){
      $scope.filter_query.event = _.keys($scope.filter_list.event)
      _.each($scope.filter_query.event, function(ev){
        $scope.clicked[ev] = true;
      });
    }

    if (!$scope.clicked[event_type]){
      if(!_.contains($scope.filter_query.event, event_type)){
        $scope.filter_query.event.push(event_type)
      }
    }else{
      $scope.filter_query.event = _.without($scope.filter_query.event, event_type)
    }
    $scope.clicked[event_type] = !$scope.clicked[event_type];
  }

  $scope.goSearch = function(){
    timelineHelper.searchKey($scope.search_string).then(function(res){
      $scope.search_key_list = res.data.list;

      if (!_.isEmpty(res.data.list)){
        $scope.filter_list.type = _.countBy($scope.search_key_list, function(elem){ return elem.type });
        $scope.filter_query.type = _.keys($scope.filter_list.type);

        for(type in $scope.filter_list.type){
          var node_list = _.filter($scope.search_key_list, function(node){
            return node.type == type
          });
          switch (type){
            case 'event':
              $scope.filter_list[type] = _.countBy(node_list, function(result){
                return result.node.event_type
              });
              $scope.filter_query[type] = _.keys($scope.filter_list[type])
              _.each($scope.filter_query[type],function(elem){
                $scope.clicked[elem]  = true;
              })
              break;
          }
        }

      }
    })
  }

};