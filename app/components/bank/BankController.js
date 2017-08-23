require('angular').module('etherLeagueApp').controller('bankCtrl', ['$scope', '$timeout', 'leagueAggregateService', 'messagesService', function($scope, $timeout, leagueAggregateService, messagesService) {

  $scope.messagesService = messagesService;
  $scope.availableFunds = 0;

  $scope.withdrawFunds = function() {
    messagesService.setInfoMessage("Funds withdrawal transaction sent....");
    leagueAggregateService.withdrawFunds()
      .then(function() {
        messagesService.setSuccessMessage("Funds withdrawn successfully");
        init();
      })
      .catch(function(err) {
        console.error(err);
        messagesService.setErrorMessage("An error occured when withdrawing the funds");
      });
  };

  var init = function() {
    leagueAggregateService.getAvailableFunds()
      .then(function(funds) {
        $timeout(function() {
          console.log("Funds:" + funds);
          $scope.availableFunds = web3.fromWei(funds, "ether");
        });
      })
  };

  init();

}]);