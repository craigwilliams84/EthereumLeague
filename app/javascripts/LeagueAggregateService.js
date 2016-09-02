angular.module('EtherLeagueServices').service('leagueAggregateService', ['accountsService', function(accountsService){
  console.log("In league agg service");
  this.addLeague = function(name, pointsForWin, pointsForDraw, entryFee, callback) {
  		var leagueAgg = LeagueAggregate.deployed();

  		leagueAgg.addLeague(fromAscii(name), pointsForWin, pointsForDraw, entryFee, {from: accountsService.getMainAccount(), 
  				gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)}).then(function() {
    		callback();
  		}).catch(function(e) {
    		callback(e);
  		});
	};
	
	this.joinLeague = function(leagueDetails, teamName, callback) {
  		var leagueAgg = LeagueAggregate.deployed();

  		leagueAgg.joinLeague(leagueDetails.id, fromAscii(teamName), {value: leagueDetails.entryFee, from: accountsService.getMainAccount(), 
  				gas: 3000000, gasPrice: web3.eth.gasPrice.toString(10)}).then(function() {
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
	
	this.getLeagueDetails = function(id, callback) {
		var leagueAgg = LeagueAggregate.deployed();
		
  	leagueAgg.getLeagueDetails.call(id).then(function(leagueDetails) {
  		callback(null, {'id': id,
						name: toAscii(leagueDetails[0]), 
						participantIds: leagueDetails[1], 
						participantNames: leagueDetails[2],
						participantScores: leagueDetails[3],
						entryFee: leagueDetails[4]});
		}).catch(function(err) {
			callback(err);
		});
	};
	
}]);