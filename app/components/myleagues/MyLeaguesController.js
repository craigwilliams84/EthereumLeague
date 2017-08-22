require('angular').module('etherLeagueApp').controller('myLeaguesCtrl', ['$scope', '$timeout', 'leagueAggregateService', 'leagueListCtrlCommon', function($scope, $timeout, leagueAggregateService) {
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  var init = function() {
    leagueAggregateService.getMyLeagues()
      .then(function(leagues) {
        $timeout(function() {
          $scope.leagues = leagues;
        })
      });
  };

  init();

}]);