require('angular').module('EtherLeagueServices').service('modalService', ['$uibModal', function($uibModal) {

  this.openModal = function(name, resolve) {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: name + '.html',
      controller: name + 'Ctrl',
      controllerAs: '$ctrl',
      resolve: resolve
      });

    return modalInstance;
  };
}]);