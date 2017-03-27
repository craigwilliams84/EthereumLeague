angular.module('EtherLeagueServices').service('resultAggregateService', ['accountsService', leagueAggregateService, function(accountsService, leagueAggregateService) {

  this.addResult = function(leagueId, homeParticipantId, homeScore, awayParticipantId, awayScore) {
    var resultAgg = ResultAggregate.deployed();

    return resultAgg.addResult(leagueId, homeParticipantId, homeScore, awayParticipantId, awayScore, {
      from: accountsService.getMainAccount(),
      gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)
    });
  };

  this.getPendingResultsForUser = function(leagueId) {
    return getPendingResultIds()
      .then(getResultDetails)
      .then(filterResultsForUser);
  };

  var filterResultsForUser = function(allResultDetails) {
    return new Promise(function(resolve, reject) {
      return leagueAggregateService.getParticipantIdsInLeagueForUser()
        .then(function(userPartIds) {
          resolve(allResultDetails.filter(function(resultDetails) {
            return (arrayContains(userPartIds, resultDetails.homeParticipantId)
              || arrayContains(userPartIds, resultDetails.awayParticipantId));
          }));
        });
    });
  };

  var getPendingResultIds = function(leagueId) {
    var resultAgg = ResultAggregate.deployed();

    retur resultAgg.getPendingResultIds(leagueId, {from: accountsService.getMainAccount()});
  };

  var getResultDetails = function(id) {
    return new Promise(function(resolve, reject) {

      var resultAgg = ResultAggregate.deployed();

      return resultAgg.getResultDetails.call(id).then(function(resultDetails) {
        var resultDetails = {
          'id': id.toString(),
          status: resultDetails[0],
          homeParticipantId: resultDetails[1],
          homeScore: resultDetails[2],
          awayParticipantId: resultDetails[3],
          awayScore: resultDetails[4],
          actedAddress: resultDetails[5]
        };
        resolve(resultDetails);
      }).catch(function(err) {
        reject(err);
      });
    });
  };

  var getResultDetailsForIds = function(resultIds) {

  };

  var arrayContains = function(array, valueToContain) {
    return array.indexOf(valueToContain) != -1
  }

}]);