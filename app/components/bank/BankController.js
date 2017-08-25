require('angular').module('etherLeagueApp').controller('bankCtrl', ['$scope', '$timeout', 'bankService', 'messagesService', function($scope, $timeout, bankService, messagesService) {

  $scope.messagesService = messagesService;
  $scope.availableFunds = 0;

  $scope.withdrawFunds = function() {
    messagesService.setInfoMessage("Funds withdrawal transaction sent....");
    bankService.withdrawFunds()
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
    bankService.getAvailableFunds()
      .then(function(funds) {
        $timeout(function() {
          $scope.availableFunds = web3.fromWei(funds, "ether");
        });
      })
  };

  init();

}]);