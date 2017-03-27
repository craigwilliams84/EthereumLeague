angular.module('etherLeagueApp').controller('leagueDetailsCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'resultAggregateService', function($scope, $routeParams, $timeout, leagueAggregateService, resultAggregateService) {
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  $scope.getLeague = function() {
    return $scope.leagues[0];
  };

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

  $scope.addResult = function(homeParticipantId, homeScore, awayParticipantId, awayScore) {
    $scope.$parent.showInfoMessage("Add result transaction sent....");
    resultAggregateService.addResult($scope.getLeague().id, homeParticipantId, homeScore, awayParticipantId, awayScore)
      .then(function() {
        console.log("Result added successfully");
        $scope.$parent.showSuccessMessage("Result added successfully");
        $scope.refreshAll();
      }).catch(function(e) {
      console.error(e);
      $scope.$parent.showErrorMessage("There was an error when adding the result");
    });
  };

  $scope.getPendingResultsForUser = function() {
    resultAggregateService.addResult($scope.getLeague().id, homeParticipantId, homeScore, awayParticipantId, awayScore)
      .then(function() {
        console.log("Result added successfully");
        $scope.$parent.showSuccessMessage("Result added successfully");
        $scope.refreshAll();
      }).catch(function(e) {
      console.error(e);
      $scope.$parent.showErrorMessage("There was an error when adding the result");
    });
  };

  $scope.shouldHideLeagueHeader = function() {
    return true;
  };

  $scope.isAdmin = function() {
    if ($scope.getLeague()) {
      return $scope.getLeague().userRoles.indexOf(ADMIN) > -1;
    }
  };

  $scope.isReferee = function() {
    if ($scope.getLeague()) {
      return $scope.getLeague().userRoles.indexOf(REFEREE) > -1;
    }
  };

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