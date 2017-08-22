require('angular').module('etherLeagueApp').controller("addRefereeModalCtrl", ['$scope', '$timeout', '$uibModalInstance', 'leagueAggregateService', 'messagesService', 'leagueId', function($scope, $timeout, $uibModalInstance, leagueAggregateService, messagesService, leagueId) {

  $scope.refereeName;
  $scope.refereeAddress;

  $scope.close = function() {
    $uibModalInstance.close();
  };

  $scope.addReferee = function(refereeName, refereeAddress) {
    messagesService.setInfoMessage("Add referee transaction sent....");
    leagueAggregateService.addReferee(leagueId, "0x" + refereeAddress)
      .then(function() {
        console.log("Referee added successfully");
        messagesService.setSuccessMessage("Referee added successfully");
      }).catch(function(e) {
        console.error(e);
        messagesService.setErrorMessage("There was an error when adding the referee");
    });

    $scope.close();
  };

}]);