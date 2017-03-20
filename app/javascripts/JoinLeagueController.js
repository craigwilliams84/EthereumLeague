angular.module('etherLeagueApp').controller('joinLeagueCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'leagueListCtrlCommon', function($scope, $routeParams, $timeout, leagueAggregateService, leagueListCtrlCommon) {
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
    $scope.$parent.showInfoMessage("Join league transaction sent....");
    leagueAggregateService.joinLeague($scope.leagues[0], teamName, function(err) {
      if (err) {
        console.error(err);
        $scope.$parent.showErrorMessage("An error occurred when attempting to join the league");
      } else {
        console.log("League joined successfully");
        $scope.$parent.showSuccessMessage("League joined successfully");
      }
    });
  }

}]);