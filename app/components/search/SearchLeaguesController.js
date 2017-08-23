require('angular').module('etherLeagueApp').controller('searchLeaguesCtrl', ['$scope', '$timeout', 'leagueAggregateService', 'messagesService', function($scope, $timeout, leagueAggregateService, messagesService) {
  $scope.messagesService = messagesService;
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  $scope.findLeague = function(leagueId) {
    $scope.leagues = [];
    leagueAggregateService.getLeagueDetails(leagueId)
      .then(function(league) {
        $timeout(function() {
          $scope.leagues[0] = league;
        });
      }).catch(function(e) {
        console.error(e);
    });
  };

  $scope.joinLeague = function(teamName) {
    messagesService.setInfoMessage("Join league transaction sent....");
    leagueAggregateService.joinLeague($scope.leagues[0], teamName)
      .then(function() {
        console.log("League joined successfully");
        messagesService.setSuccessMessage("League joined successfully");
      })
      .catch(function(err) {
        console.error(err);
        messagesService.setErrorMessage("An error occurred when attempting to join the league");
      })
  };

}]);