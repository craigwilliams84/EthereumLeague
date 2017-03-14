angular.module('EtherLeagueServices').service('leagueAggregateService', ['accountsService', function(accountsService) {
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

  this.getAdminLeagueIds = function(callback) {
    var leagueAgg = LeagueAggregate.deployed();

    leagueAgg.getLeaguesForAdmin.call("0x" + accountsService.getMainAccount(), {from: accountsService.getMainAccount()}).then(function(leagueIds) {
      console.log("League ids length: " + leagueIds.length);
      callback(null, leagueIds);
    }).catch(function(err) {
      callback(err);
    });
  };

  this.getParticipantLeagueIds = function(callback) {
    var leagueAgg = LeagueAggregate.deployed();

    var onLeagueJoinedEvent = leagueAgg.OnLeagueJoined({participantAddress: "0x" + accountsService.getMainAccount()},
      {fromBlock: 0, toBlock: web3.eth.getBlockNumber()});

    onLeagueJoinedEvent.get(function(err, logs) {
      if (err) {
        callback(err);
      } else {
        var leagueIds = new Set();

        logs.forEach(function(log) {
          //Convert to string as Set doesn't seem to be able to figure out when 2 BigInteger values are equal
          leagueIds.add(log.args.leagueId.toString());
        });

        callback(null, [...leagueIds.values()
      ])
        ;
      }
    });
  };

  this.getLeagueDetails = function(id, callback) {
    var leagueAgg = LeagueAggregate.deployed();

    leagueAgg.getLeagueDetails.call(id).then(function(leagueDetails) {
      callback(null, {
        'id': id,
        name: toAscii(leagueDetails[0]),
        participantIds: leagueDetails[1],
        participantNames: leagueDetails[2],
        participantScores: leagueDetails[3],
        entryFee: leagueDetails[4],
        status: getStatus(leagueDetails[5])
      });
    }).catch(function(err) {
      callback(err);
    });
  };
  
  var getStatus = function(statusCode) {
    if (statusCode == 0) {
      return "AWAITING PARTICIPANTS";
    } else if (statusCode == 1) {
      return "IN PROGRESS";
    }
  }

}]);