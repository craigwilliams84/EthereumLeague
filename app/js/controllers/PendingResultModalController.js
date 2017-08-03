require('angular').module('etherLeagueApp').controller("pendingResultModalCtrl", ['$scope', '$timeout', '$uibModalInstance', 'resultAggregateService', 'messagesService', 'accountsService', 'leagueId', 'result', function($scope, $timeout, $uibModalInstance, resultAggregateService, messagesService, accountsService, leagueId, result) {

  $scope.result = result;

  $scope.close = function() {
    $uibModalInstance.close();
  };

  $scope.acceptResult = function() {
    messagesService.setInfoMessage("Result accept transaction sent....");
    resultAggregateService.acceptResult(leagueId, result.id)
      .then(function() {
        console.log("Result accepted successfully");
        messagesService.setSuccessMessage("Result accepted successfully");
      }).catch(function(e) {
        console.error(e);
        messagesService.setErrorMessage("There was an error when adding the result");
    });

    $scope.close();
  };

  $scope.canAcceptPendingResult = function() {
    if ($scope.result.actedAddress == "0x" + accountsService.getMainAccount()) {
      //Already acted
      return false;
    }

    return true;
  };

}]);