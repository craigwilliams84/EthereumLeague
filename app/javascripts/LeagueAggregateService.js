const ADMIN = "Admin";
const REFEREE = "Referee";
const PARTICIPANT= "Participant";

angular.module('EtherLeagueServices').service('leagueAggregateService', ['accountsService', 'leagueCacheService', function(accountsService, leagueCacheService) {
  this.addLeague = function(name, pointsForWin, pointsForDraw, entryFee, numOfEntrants, callback) {
    var leagueAgg = LeagueAggregate.deployed();

    leagueAgg.addLeague(fromAscii(name), pointsForWin, pointsForDraw, entryFee, numOfEntrants, {
      from: accountsService.getMainAccount(),
      gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)
    }).then(function() {
      callback();
    }).catch(function(e) {
      callback(e);
    });
  };

  this.joinLeague = function(leagueDetails, teamName, callback) {
    var leagueAgg = LeagueAggregate.deployed();

    leagueAgg.joinLeague(leagueDetails.id, fromAscii(teamName), {
      from: accountsService.getMainAccount(), value: leagueDetails.entryFee,
      gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)
    }).then(function() {
      callback();
    }).catch(function(e) {
      callback(e);
    });
  };

  this.addReferee = function(leagueId, refereeAddress) {
    var leagueAgg = LeagueAggregate.deployed();

    return leagueAgg.addRefereeToLeague(leagueId, refereeAddress, {
      from: accountsService.getMainAccount(),
      gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)
    });
  };

  this.getMyLeagues = function() {
    var myLeagues = [];
    return accountsService.whenInitialised()
      .then(this.getAdminLeagueIds)
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
    return new Promise(function(resolve, reject) {
      var leagueAgg = LeagueAggregate.deployed();
      return leagueAgg.getLeaguesForAdmin.call("0x" + accountsService.getMainAccount(), {from: accountsService.getMainAccount()})
        .then(function(leagueIds) {
          console.log("League ids length: " + leagueIds.length);
          //resolve(createIdsAndRoles(leagueIds, ADMIN));
          resolve(leagueIds);
      }).catch(function(err) {
        reject(err);
      });
    });
  };

  this.getParticipantLeagueIds = function() {
    return new Promise(function(resolve, reject) {
      var leagueAgg = LeagueAggregate.deployed();

      var onLeagueJoinedEvent = leagueAgg.OnLeagueJoined({participantAddress: "0x" + accountsService.getMainAccount()},
        {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});

      onLeagueJoinedEvent.get(function(err, logs) {
        if (err) {
          reject(err);
        } else {
          var leagueIds = new Set();

          logs.forEach(function(log) {
            //Convert to string as Set doesn't seem to be able to figure out when 2 BigInteger values are equal
            leagueIds.add(log.args.leagueId.toString());
          });

          resolve([...leagueIds.values()]);
        }
      });
    });
  };

  this.getParticipantIdsInLeagueForUser = function(leagueId) {
    return new Promise(function(resolve, reject) {
      var leagueAgg = LeagueAggregate.deployed();

      var onLeagueJoinedEvent = leagueAgg.OnLeagueJoined({leagueId: leagueId, participantAddress: "0x" + accountsService.getMainAccount()},
        {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});

      onLeagueJoinedEvent.get(function(err, logs) {
        if (err) {
          reject(err);
        } else {
          var participantIds = new Set();

          logs.forEach(function(log) {
            //Convert to string as Set doesn't seem to be able to figure out when 2 BigInteger values are equal
            participantIds.add(log.args.participantId.toString());
          });

          resolve([...participantIds.values()]);
        }
      });
    });
  };

  this.getRefereeLeagueIds = function() {
    return new Promise(function(resolve, reject) {
      var leagueAgg = LeagueAggregate.deployed();

      var onRefereeAddedEvent = leagueAgg.OnRefereeAdded({refereeAddress: "0x" + accountsService.getMainAccount()},
        {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});

      onRefereeAddedEvent.get(function(err, logs) {
        if (err) {
          reject(err);
        } else {
          var leagueIds = new Set();

          logs.forEach(function(log) {
            //Convert to string as Set doesn't seem to be able to figure out when 2 BigInteger values are equal
            leagueIds.add(log.args.leagueId.toString());
          });

          resolve([...leagueIds.values()]);
        }
      });
    });
  };

  var createIdsAndRoles = function(leagueIds, role) {
    var idsAndRoles = {};
    leagueIds.forEach(function(leagueId){
      var idAndRole = {};
      idAndRole.id = leagueId;
      idAndRole.role = role;
    });

    return idsAndRoles;
  };

  var mergeLeagueRoles = function(leagues) {
    var leaguesMap = new Map();
    return new Promise(function(resolve) {
      leagues.forEach(function(league) {
        var existing = leaguesMap.get(league.id);
        if (existing) {
          existing.userRoles = existing.userRoles.concat(league.userRoles);
          leaguesMap.set(league.id, existing);
          leagueCacheService.put(league.id, existing);
        } else {
          leaguesMap.set(league.id, league);
          leagueCacheService.put(league.id, league);
        }
      });

      resolve(Array.from(leaguesMap.values()));
    });
  };

  var getLeagueDetails = function(id, useCache, ...userRoles) {

    return new Promise(function(resolve, reject) {
      if (useCache) {
        var cached = leagueCacheService.get(id);

        if (cached) {
          resolve(cached);
          return;
        }
      }

      var leagueAgg = LeagueAggregate.deployed();

      return leagueAgg.getLeagueDetails.call(id).then(function(leagueDetails) {
        var leagueDetails = {
          'id': id.toString(),
          name: toAscii(leagueDetails[0]),
          participantIds: leagueDetails[1],
          participantNames: toAsciiArray(leagueDetails[2]),
          participantScores: leagueDetails[3],
          entryFee: leagueDetails[4],
          status: getStatus(leagueDetails[5]),
          userRoles: userRoles
        };

        addSortedEntriesToLeagueDetails(leagueDetails);
        leagueCacheService.put(id, leagueDetails);
        resolve(leagueDetails);
      }).catch(function(err) {
        reject(err);
      });
    });
  };

  //TODO need to sort this
  this.getLeagueDetails = getLeagueDetails;

  var getLeagueDetailsForIds = function(leagueIds, role) {
    var leagues = [];
    var promises = [];
    leagueIds.forEach(function(id) {
      var promise = getLeagueDetails(id, false, role)
        .then(function(leagueDetails) {
          leagues.push(leagueDetails);
        });
      promises.push(promise);
    });
    return Promise.all(promises).then(function() {
      return leagues;
    });
  };

  var loadLeagues = function(leagueIdFunction, leagueList, finishedCallback) {
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
    return {'id': id, 'name': name, 'score': score};
  };
  
  var getStatus = function(statusCode) {
    if (statusCode == 0) {
      return "AWAITING PARTICIPANTS";
    } else if (statusCode == 1) {
      return "IN PROGRESS";
    }
  }

  var toAsciiArray = function(bytesArray) {
    return bytesArray.map(function(bytesValue) {
      return toAscii(bytesValue);
    });
  }

}]);