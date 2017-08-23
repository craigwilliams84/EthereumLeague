require('angular').module('etherLeagueApp').controller("loginModalCtrl", ['$scope', '$uibModalInstance', 'loginService', 'accountsService', function($scope, $uibModalInstance, loginService, accountsService) {
  $scope.close = function() {
    $uibModalInstance.close();
  };

  $scope.metamaskLogin = function() {
    return accountsService.login(loginService.metamaskLogin)
      .then($scope.close);
  };

  $scope.mnemonicLogin = function() {
    return accountsService.login(loginService.mnemonicLogin)
      .then($scope.close);
  };

}]);