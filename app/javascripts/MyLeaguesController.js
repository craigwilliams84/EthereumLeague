angular.module('etherLeagueApp').controller('myLeaguesCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'leagueListCtrlCommon', function($scope, $routeParams, $timeout, leagueAggregateService, leagueListCtrlCommon) {
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  var init = function() {
    leagueListCtrlCommon.loadLeagues(leagueAggregateService.getParticipantLeagueIds, $scope.leagues);
  };

  init();

}]);