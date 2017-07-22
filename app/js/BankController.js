require('angular').module('etherLeagueApp').controller('bankCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', function($scope, $routeParams, $timeout, leagueAggregateService) {

  $scope.availableFunds = 0;

  $scope.withdrawFunds = function() {
    $scope.$parent.showInfoMessage("Funds withdrawal transaction sent....");
    leagueAggregateService.withdrawFunds()
      .then(function() {
        $scope.$parent.showSuccessMessage("Funds withdrawn successfully");
        init();
      })
      .catch(function(err) {
        console.error(err);
        $scope.$parent.showErrorMessage("An error occured when withdrawing the funds");
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