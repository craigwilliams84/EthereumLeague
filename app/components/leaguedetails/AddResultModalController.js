require('angular').module('etherLeagueApp').controller("addResultModalCtrl", ['$scope', '$uibModalInstance', 'resultAggregateService', 'messagesService', 'league', function($scope, $uibModalInstance, resultAggregateService, messagesService, league) {

  $scope.participants;
  $scope.selectedHomeParticipant = {value: {}};
  $scope.selectedAwayParticipant = {value: {}};

  $scope.close = function() {
    $uibModalInstance.close();
  };

  $scope.addResult = function(homeParticipantId, homeScore, awayParticipantId, awayScore) {
    messagesService.setInfoMessage("Add result transaction sent....");
    resultAggregateService.addResult(league.id,
      $scope.selectedHomeParticipant.value.id, homeScore, $scope.selectedAwayParticipant.value.id, awayScore)
      .then(function() {
        console.log("Result added successfully");
        messagesService.setSuccessMessage("Result added successfully");
      })
      .catch(function(e) {
        console.error(e);
        messagesService.setErrorMessage("There was an error when adding the result");
      });

    $scope.close();
  };

  var init = function() {
    $scope.participants = league.participantIds.map(function(value, index) {
      return {id: value, name: league.participantNames[index]};
    });
  };

  init();

}]);