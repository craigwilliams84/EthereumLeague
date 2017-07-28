contract = require("truffle-contract");
resultAggregateContract = require("../../build/contracts/ResultAggregate.json");
ResultAggregate = contract(resultAggregateContract);

require('angular').module('EtherLeagueServices').service('resultAggregateService', ['accountsService', 'leagueAggregateService', function(accountsService, leagueAggregateService) {

  this.addResult = function(leagueId, homeParticipantId, homeScore, awayParticipantId, awayScore) {
    return getResultAggregate()
      .then(function(resultAgg) {
        return resultAgg.addResult(leagueId, homeParticipantId.valueOf(), homeScore, awayParticipantId.valueOf(), awayScore, {
          from: accountsService.getMainAccount(),
          gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)
        });
      });
  };

  this.getMyPendingResults = function(leagueId) {
    return getPendingResultIds(leagueId)
      .then(function(resultIds) {
        return getResultDetailsForIds(leagueId, resultIds);
      })
      .then(filterResultsForUser);
  };

  this.acceptResult = function(leagueId, resultId) {
    return getResultAggregate()
      .then(function(resultAgg) {
        return resultAgg.acceptResult(leagueId, resultId.valueOf(), {
          from: accountsService.getMainAccount(),
          gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)
        });
      });
  };

  var filterResultsForUser = function(allResultDetails) {
    return new Promise(function(resolve, reject) {
      return leagueAggregateService.getParticipantIdsInLeagueForUser()
        .then(function(userPartIds) {
          resolve(allResultDetails.filter(function(resultDetails) {
            return (arrayContains(userPartIds, resultDetails.homeParticipantId.toString())
              || arrayContains(userPartIds, resultDetails.awayParticipantId.toString()));
          }));
        });
    });
  };

  var getPendingResultIds = function(leagueId) {
    return getResultAggregate()
      .then(function(resultAgg) {
        return resultAgg.getPendingResultIds(leagueId.valueOf(), {from: accountsService.getMainAccount()});
      });
  };

  var getResultDetails = function(leagueId, resultId) {
    return getResultAggregate()
      .then(function(resultAgg) {
        return resultAgg.getResultDetails.call(leagueId, resultId.valueOf());
      })
      .then(function(resultDetails) {
        return {
          'id': resultId.toString(),
          status: resultDetails[0],
          homeParticipantId: resultDetails[1],
          homeScore: resultDetails[2],
          awayParticipantId: resultDetails[3],
          awayScore: resultDetails[4],
          actedAddress: resultDetails[5]
        };
      });
  };

  var getResultDetailsForIds = function(leagueId, resultIds) {
    var promises = [];
    var allResultDetails = [];

    resultIds.forEach(function(resultId) {
      promises.push(getResultDetails(leagueId, resultId)
          .then(function(resultDetails) {
            allResultDetails.push(resultDetails);
        }));
    });

    return new Promise(function(resolve, reject) {
      return Promise.all(promises)
        .then(function() {
          resolve(allResultDetails);
        });
    });
  };

  var arrayContains = function(array, valueToContain) {
    return array.indexOf(valueToContain) != -1
  }

  var getResultAggregate = function() {
    return ResultAggregate.deployed();
  }

}]);