require('angular').module('etherLeagueApp').controller('createLeagueCtrl', ['$scope', 'leagueAggregateService', 'leagueListCtrlCommon', 'messagesService', function($scope, leagueAggregateService, leagueListCtrlCommon, messagesService) {
  $scope.messagesService = messagesService;
  $scope.leagues = [];

  $scope.refreshLeagues = function() {
    $scope.leagues = [];
    init();
  };

  $scope.addLeague = function(name, pointsForWin, pointsForDraw, entryFeeEther, numOfEntrants, timesToPlay) {
    messagesService.setInfoMessage("League creation transaction sent....");
    leagueAggregateService.addLeague(name, pointsForWin, pointsForDraw, entryFeeEther, numOfEntrants, timesToPlay)
      .then(function() {
        console.log("League created successfully");
        messagesService.setSuccessMessage("League created successfully");
        $scope.refreshAll();
      })
      .catch(function(err) {
        console.error(err);
        messagesService.setErrorMessage("There was an error when creating the league");
      });
  };

  var init = function() {
    leagueListCtrlCommon.loadLeagues(leagueAggregateService.getAdminLeagueIds, $scope.leagues);
  };

  init();

}]);