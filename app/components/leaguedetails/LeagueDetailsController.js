require('angular').module('etherLeagueApp').controller('leagueDetailsCtrl', ['$scope', '$routeParams', '$timeout', 'leagueAggregateService', 'resultAggregateService', 'accountsService', 'messagesService', 'modalService', function($scope, $routeParams, $timeout, leagueAggregateService, resultAggregateService, accountsService, messagesService, modalService) {
  $scope.messagesService = messagesService;
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
  };

  $scope.showAddRefereeModal = function() {
    var resolve = {
      leagueId: function() {
        return $scope.getLeague().id;
      }
    };

    modalService.openModal("addRefereeModal", resolve);
  };

  $scope.showAddResultModal = function() {
    var resolve = {
      league: function() {
        return $scope.getLeague();
      }
    };

    modalService.openModal("addResultModal", resolve);
  };

  $scope.showPendingResultModal = function(result) {
    var resolve = {
      result: function() {
        return result;
      },
      leagueId: function() {
        return $scope.getLeague().id;
      }
    };

    modalService.openModal("pendingResultModal", resolve);
  };

  $scope.acceptResult = function(resultId) {
    messagesService.setInfoMessage("Result accept transaction sent....");
    resultAggregateService.acceptResult($scope.getLeague().id, resultId)
      .then(function() {
        console.log("Result accepted successfully");
        messagesService.setSuccessMessage("Result accepted successfully");
        $scope.refreshAll();
      }).catch(function(e) {
      console.error(e);
      messagesService.setErrorMessage("There was an error when adding the result");
    });
  };

  $scope.shouldHideLeagueHeader = function() {
    return true;
  };

  $scope.isAdmin = function() {
    if ($scope.getLeague()) {
      return hasRole($scope.getLeague(), "Admin");
    }
  };

  $scope.isReferee = function() {
    if ($scope.getLeague()) {
      return hasRole($scope.getLeague(), "Referee");
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

  var hasRole = function(leagueId, role) {
    return !leagueId.userRoles.every((aRole) => {return aRole != role});
  }

  var init = function() {
    var leagueId = $routeParams.leagueId;

    leagueAggregateService.getRolesForLeague(leagueId)
      .then((roles) => {
        return leagueAggregateService.getLeagueDetails(leagueId, roles);
      })
      .then(function(league) {
        $timeout(function() {
          $scope.leagues.push(league);
        });
        return leagueId;
      })
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