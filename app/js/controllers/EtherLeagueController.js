require('angular').module('etherLeagueApp').controller("etherLeagueController", ['$scope', '$rootScope', '$location', '$timeout', 'leagueAggregateService', 'accountsService', 'messagesService', function($scope, $rootScope, $location, $timeout, leagueAggregateService, accountsService, messagesService) {

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
    accountsService.getBalance(function(err, result) {
      if (err) {
        console.log(err);
      } else {
        $timeout(function() {
          $scope.balance = result;
        });
      }
    });
  };

  $scope.startLogin = function() {
    accountsService.init(function() {
      $scope.refreshAll();
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
