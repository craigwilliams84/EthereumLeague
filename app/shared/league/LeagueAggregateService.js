contract = require("truffle-contract");
leagueAggregateContract = require("../../../build/contracts/LeagueAggregate.json");
LeagueAggregate = contract(leagueAggregateContract);

const ADMIN = "Admin";
const REFEREE = "Referee";
const PARTICIPANT= "Participant";
const STATUSES={0: "AWAITING PARTICIPANTS", 1: "IN PROGRESS", 2: "COMPLETED"};

require('angular').module('EtherLeagueServices').service('leagueAggregateService', ['accountsService', function(accountsService) {
  const thisService = this;

  this.addLeague = function(name, pointsForWin, pointsForDraw, entryFeeEther, numOfEntrants, timesToPlay) {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.addLeague(web3.fromAscii(name), pointsForWin,
          pointsForDraw, web3.toWei(entryFeeEther, "ether"), numOfEntrants, timesToPlay, {
          from: accountsService.getMainAccount(),
          gas: 3000000
        });
      });
  };

  this.joinLeague = function(leagueDetails, teamName) {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.joinLeague(leagueDetails.id, web3.fromAscii(teamName), {
          from: accountsService.getMainAccount(), value: leagueDetails.entryFee,
          gas: 3000000
        });
      })
  };

  this.addReferee = function(leagueId, refereeAddress) {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.addRefereeToLeague(leagueId, refereeAddress, {
          from: accountsService.getMainAccount(),
          gas: 3000000
        });
      })
  };

  this.withdrawFunds = function() {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.withdrawFunds({
          from: accountsService.getMainAccount(),
          gas: 3000000
        });
      })
  };

  this.getMyLeagues = function() {
    var myLeagues = [];
    return this.getAdminLeagueIds()
      .then(function(leagueIds) {
        return getLeagueDetailsForIds(leagueIds, ADMIN);
      })
      .then(function(adminLeagues) {myLeagues = myLeagues.concat(adminLeagues);})
      .then(this.getParticipantLeagueIds)
      .then(function(leagueIds) {
        return getLeagueDetailsForIds(leagueIds, PARTICIPANT);
      })
      .then(function(participantLeagues) {myLeagues = myLeagues.concat(participantLeagues);})
      .then(this.getRefereeLeagueIds)
      .then(function(leagueIds) {
        return getLeagueDetailsForIds(leagueIds, REFEREE);
      })
      .then(function(refereeLeagues) {return myLeagues.concat(refereeLeagues);})
      .then(mergeLeagueRoles)
  };

  this.getAdminLeagueIds = function() {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.getLeaguesForAdmin.call("0x" + accountsService.getMainAccount(), {from: accountsService.getMainAccount()})
      });
  };

  this.getParticipantIdsInLeagueForUser = function(leagueId) {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.OnLeagueJoined({leagueId: leagueId, participantAddress: "0x" + accountsService.getMainAccount()},
                                        {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});
      })
      .then(function(event) {
        return getIdsFromEvent(event, "participantId")
      });
  };

  this.getParticipantLeagueIds = function() {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.OnLeagueJoined({participantAddress: "0x" + accountsService.getMainAccount()},
                                        {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});
      })
      .then(getLeagueIdsFromEvent);
  };

  this.getRefereeLeagueIds = function() {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.OnRefereeAdded({refereeAddress: "0x" + accountsService.getMainAccount()},
                                        {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});
      })
      .then(getLeagueIdsFromEvent);
  };

  this.getAvailableFunds = function() {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.getAvailableFunds.call({from: accountsService.getMainAccount()});
      });
  };

  thisService.getLeagueDetails = function(id, ...userRoles) {
    return getLeagueAggregate()
      .then(function(leagueAgg) {
        return leagueAgg.getLeagueDetails.call(id.valueOf()).then(function(leagueDetails) {
          var leagueDetails = {
            'id': id.toString(),
            name: web3.toAscii(leagueDetails[0]),
            participantIds: leagueDetails[1],
            participantNames: toAsciiArray(leagueDetails[2]),
            participantScores: leagueDetails[3],
            entryFee: leagueDetails[4],
            entryFeeForDisplay: web3.fromWei(leagueDetails[4], "ether").toString(),
            prizeForDisplay: web3.fromWei(leagueDetails[4] * leagueDetails[1].length, "ether").toString(),
            status: getStatus(leagueDetails[5]),
            userRoles: userRoles
          };

          addSortedEntriesToLeagueDetails(leagueDetails);
          return leagueDetails;
        });
      });
  };

  thisService.getRolesForLeague = function(leagueId) {
    var roles = [];

    var addToRolesIfIdExists = function(id, ids, role) {
      if (ids.length > 0 && ids.every((anId) => {return !anId.toString() == id.toString()})) {
        roles.push(role);
      }
    };

    return this.getAdminLeagueIds()
      .then(function(leagueIds) {
        addToRolesIfIdExists(leagueId, leagueIds, ADMIN);
      })
      .then(this.getParticipantLeagueIds)
      .then(function(leagueIds) {
        addToRolesIfIdExists(leagueId, leagueIds, PARTICIPANT);
      })
      .then(this.getRefereeLeagueIds)
      .then(function(leagueIds) {
        addToRolesIfIdExists(leagueId, leagueIds, REFEREE);
      })
      .then(function() {
        return roles;
      });
  };

  var getLeagueIdsFromEvent = function(event) {
    return getIdsFromEvent(event, "leagueId");
  };

  var getIdsFromEvent = function(event, idKey) {
    return new Promise(function(resolve, reject) {
      event.get(function(err, logs) {
        if (err) {
          reject(err);
        } else {
          var ids = new Set();

          logs.forEach(function(log) {
            //Convert to string as Set doesn't seem to be able to figure out when 2 BigInteger values are equal
            ids.add(log.args[idKey].toString());
          });

          resolve([...ids.values()]);
        }
      });
    });
  };

  var mergeLeagueRoles = function(leagues) {
    var leaguesMap = new Map();
    return new Promise(function(resolve) {
      leagues.forEach(function(league) {
        var existing = leaguesMap.get(league.id);
        if (existing) {
          existing.userRoles = existing.userRoles.concat(league.userRoles);
          leaguesMap.set(league.id, existing);
        } else {
          leaguesMap.set(league.id, league);
        }
      });

      resolve(Array.from(leaguesMap.values()));
    });
  };

  var getLeagueDetailsForIds = function(leagueIds, role) {
    var leagues = [];
    var promises = [];
    leagueIds.forEach(function(id) {
      var promise = thisService.getLeagueDetails(id, role)
        .then(function(leagueDetails) {
          leagues.push(leagueDetails);
        });
      promises.push(promise);
    });
    return Promise.all(promises).then(function() {
      return leagues;
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
      return b.score - a.score;
    });
  };

  var createLeagueEntry = function(id, name, score) {
    return {'id': id, 'name': name, 'score': score};
  };

  var getLeagueAggregate = function() {
    return LeagueAggregate.deployed();
  }
  
  var getStatus = function(statusCode) {
    return STATUSES[statusCode];
  }

  var toAsciiArray = function(bytesArray) {
    return bytesArray.map(function(bytesValue) {
      return web3.toAscii(bytesValue);
    });
  }

}]);