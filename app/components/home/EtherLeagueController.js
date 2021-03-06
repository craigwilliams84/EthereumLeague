require('angular').module('etherLeagueApp').controller("etherLeagueController", ['$scope', '$rootScope', '$location', '$timeout', 'leagueAggregateService', 'accountsService', 'messagesService', 'modalService', function($scope, $rootScope, $location, $timeout, leagueAggregateService, accountsService, messagesService, modalService) {

  $scope.balance = "";
  $scope.account = "";
  $scope.messages;

  $scope.adminLeagues = [];
  $scope.participantLeagues = [];

  $scope.isLoggedIn = false;

  $scope.isNavCollapsed = true;

  $scope.refreshAll = function() {
    $timeout(function() {
      $scope.refreshBalance();
    });
  };

  $scope.refreshBalance = function() {
    accountsService.getBalance()
      .then(function(balance) {
        $timeout(function() {
          $scope.balance = balance;
        });
      })
      .catch(function(err) {
        console.log(err);
      });
  };

  $scope.showLoginModal = function() {
    modalService.openModal("loginModal")
      .result
      .then(function() {
        $timeout(function() {
          $scope.isLoggedIn = true;
          $scope.account = accountsService.getMainAccount();
          $location.path("/loginSuccess/");
        });
      });
  };

  $scope.$on('$locationChangeStart', function(event) {
    messagesService.clearMessages();

    $timeout(function() {
      $scope.isNavCollapsed = true;
    });
  });

  $rootScope.$on('messagesUpdated', function(event) {
    var messages = messagesService.getMessages();

    $timeout(function() {
      $scope.messages = messages;
    });
  });
}]);
