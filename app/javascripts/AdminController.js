angular.module('etherLeagueApp').controller('adminCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'leagueListCtrlCommon', function($scope, $routeParams, $timeout, leagueAggregateService, leagueListCtrlCommon) {
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  $scope.addLeague = function(name, pointsForWin, pointsForDraw, entryFee, numOfEntrants) {
    $scope.$parent.showInfoMessage("League creation transaction sent....");
    leagueAggregateService.addLeague(name, pointsForWin, pointsForDraw, entryFee, numOfEntrants, function(err) {

      if (err) {
        console.error(err);
        $scope.$parent.showErrorMessage("There was an error when creating the league");
      } else {
        console.log("League created successfully");
        $scope.$parent.showSuccessMessage("League created successfully");
        $scope.refreshAll();
      }
    });
  };

  var init = function() {
    leagueListCtrlCommon.loadLeagues(leagueAggregateService.getAdminLeagueIds, $scope.leagues);
  };

  init();

}]);