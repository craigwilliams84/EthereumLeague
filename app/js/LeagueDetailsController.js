require('angular').module('etherLeagueApp').controller('leagueDetailsCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'resultAggregateService', 'accountsService', function($scope, $routeParams, $timeout, leagueAggregateService, resultAggregateService, accountsService) {
  $scope.leagues = [];
  $scope.pendingResults = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    $scope.pendingResults = [];
    init();
  };

  $scope.getLeague = function() {
    return $scope.leagues[0];
  };

  $scope.hasPendingResults = function() {
    return $scope.pendingResults.length > 0;
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

  $scope.addResult = function(homeParticipantId, homeScore, awayParticipantId, awayScore) {
    $scope.$parent.showInfoMessage("Add result transaction sent....");
    resultAggregateService.addResult($scope.getLeague().id, homeParticipantId, homeScore, awayParticipantId, awayScore)
      .then(function() {
        console.log("Result added successfully");
        $scope.$parent.showSuccessMessage("Result added successfully");
        $scope.refreshAll();
      })
      .catch(function(e) {
        console.error(e);
        $scope.$parent.showErrorMessage("There was an error when adding the result");
    });
  };

  $scope.acceptResult = function(resultId) {
    $scope.$parent.showInfoMessage("Result accept transaction sent....");
    resultAggregateService.acceptResult($scope.getLeague().id, resultId)
      .then(function() {
        console.log("Result accepted successfully");
        $scope.$parent.showSuccessMessage("Result accepted successfully");
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
      return $scope.getLeague().userRoles.indexOf("Admin") > -1;
    }
  };

  $scope.isReferee = function() {
    if ($scope.getLeague()) {
      return $scope.getLeague().userRoles.indexOf("Referee") > -1;
    }
  };
  
  $scope.getParticipantName = function(partId) {
    var leagueDetails = $scope.getLeague();

    var index = -1;

    for(var i = 0; i < leagueDetails.participantIds.length; i++){
      if (leagueDetails.participantIds[i].equals(partId)) {
        index = i;
        break;
      }
    }

    if (index < 0) {
      return;
    }

    return leagueDetails.participantNames[index];
  };

  $scope.canAcceptPendingResult = function(result) {
    if (result.actedAddress == "0x" + accountsService.getMainAccount()) {
      //Already acted
      return false;
    }

    return true;
  };

  var init = function() {
    leagueAggregateService.getLeagueDetails($routeParams.leagueId, true)
    .then(function(league) {
      $timeout(function() {
        $scope.leagues.push(league);
      });
    }).then(function() {return $routeParams.leagueId})
      .then(resultAggregateService.getMyPendingResults)
      .then(function(pendingResults){
        $timeout(function() {
          if (pendingResults) {
            $scope.pendingResults = pendingResults;
          }
        })
      });
  };

  init();

}]);