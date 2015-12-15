app.controller('PopoverController', ['$scope', PopoverController]);
app.controller('ModalController', ['$scope', '$uibModal', '$log', ModalController]);
app.controller('DeleteModal', ['$scope', '$uibModalInstance', '$http', '$rootScope','stage_id', DeleteModal]);

function PopoverController($scope){
  $scope.addStage = {
    templateUrl: 'template/timeline/popover/stage.html?bust=' + Math.random().toString(36).slice(2),
    title: 'Add Stage'
  };
  $scope.addEvent = {
    templateUrl: 'template/timeline/popover/event.html?bust=' + Math.random().toString(36).slice(2),
    title: 'Add Event'
  };
}

function ModalController($scope, $uibModal, $log){
  $scope.open = function (stage_id) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'template/timeline/modal/delete.html?bust=' + Math.random().toString(36).slice(2),
      controller: 'DeleteModal',
      size: 'sm',
      resolve: {
        stage_id: function () {
          return stage_id;
        }
      }
    });

    modalInstance.result.then(function () {
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
}

function DeleteModal($scope, $uibModalInstance, $http, $rootScope, stage_id){
  $scope.stage_id = stage_id;

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };

  $scope.deleteStage = function(stage_id){
    $http
      .delete("http://localhost:3000/api/timeline/stage/" + stage_id)
      .then(function(res){
        $scope.$emit('deleted_stage', stage_id)
        $uibModalInstance.close();
      }, function(error){
        console.log(error)
      })
  }
}
