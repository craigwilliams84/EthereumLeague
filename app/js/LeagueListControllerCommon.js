require('angular').module('EtherLeagueServices').service('leagueListCtrlCommon', ['$timeout', 'leagueAggregateService', function($timeout, leagueAggregateService) {

  this.loadLeagues = function(leagueIdFunction, leagueList, finishedCallback) {
    leagueIdFunction(function(err, leagueIds) {
      if (err) {
        console.error(err);
        if (finishedCallback) {
          finishedCallback(err);
        }
      } else {
        var retrievedCount = 0;
        leagueIds.forEach(function(id) {
          leagueAggregateService.getLeagueDetails(id, function(err, leagueDetails) {
            $timeout(function() {
              addSortedEntriesToLeagueDetails(leagueDetails);
              leagueList.push(leagueDetails);
              retrievedCount++;

              if (finishedCallback && retrievedCount == leagueIds.length) {
                finishedCallback();
              }
            });
          });
        });
      }
    });
  };

  var addSortedEntriesToLeagueDetails = function(leagueDetails) {
    leagueDetails.entries = [];
    for (var i = 0; i < leagueDetails.participantIds.length; i++) {
      leagueDetails.entries.push(
        createLeagueEntry(leagueDetails.participantIds[i],
          leagueDetails.participantNames[i],
          leagueDetails.participantScores[i]));
    }

    leagueDetails.entries.sort(function(a, b) {
      return a.score - b.score;
    });
  };

  var createLeagueEntry = function(id, name, score) {
    return {'id': id, 'name': toAscii(name), 'score': score};
  };

}]);