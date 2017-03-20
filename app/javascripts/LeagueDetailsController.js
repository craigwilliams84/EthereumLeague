angular.module('etherLeagueApp').controller('leagueDetailsCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'leagueListCtrlCommon', function($scope, $routeParams, $timeout, leagueAggregateService, leagueListCtrlCommon) {
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  $scope.getLeague = function() {
    return $scope.leagues[0];
  }

  $scope.addReferee = function(refereeName, refereeAddress) {
    $scope.$parent.showInfoMessage("Add referee transaction sent....");
    leagueAggregateService.addReferee($scope.getLeague().id, "0x" + refereeAddress)
      .then(function() {
        console.log("Referee added successfully");
        $scope.$parent.showSuccessMessage("Referee added successfully");
        $scope.refreshAll();
      }).catch(function(e) {
        console.error(e);
        $scope.$parent.showErrorMessage("There was an error when adding the referee");
      });
  };

  $scope.shouldHideLeagueHeader = function() {
    return true;
  };

  $scope.isAdmin = function() {
    if ($scope.getLeague()) {
      return $scope.getLeague().userRoles.indexOf(ADMIN) > -1;
    }
  }

  var init = function() {
    leagueAggregateService.getLeagueDetails($routeParams.leagueId, true)
    .then(function(league) {
      $timeout(function() {
        $scope.leagues.push(league);
      })
    })
  };

  init();

}]);