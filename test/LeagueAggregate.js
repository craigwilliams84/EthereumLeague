contract('LeagueAggregate', function(accounts) {
  
  it("should be able to add a new league", function(done){
    leagueAgg = LeagueAggregate.deployed();    
    	
    leagueAgg.addLeague(fromAscii("Test League"), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		assert.equal(leagueIds.length, 1, "League not added correctly");		
    		done();
    	});
    }).catch(function(err) {
    	done(err);
  	});
  });
  
  it("should be able to add a referee to a league", redeploy(accounts[0], function(done, leagueAgg){    	
    leagueAgg.addLeague(fromAscii("Test League"), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.addRefereeToLeague(leagueIds[0], accounts[1], {from: accounts[0], gas: 3000000}).then(function() {
    			return leagueAgg.isReferee.call(leagueIds[0], accounts[1]).then(function(isReferee) {
    				assert.equal(isReferee, true, "Referee not added to the league correctly");
    				done();
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should not be able to add a referee to a league from non admin address", redeploy(accounts[0], function(done, leagueAgg){    	
    leagueAgg.addLeague(fromAscii("Test League"), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.addRefereeToLeague(leagueIds[0], accounts[1], {from: accounts[1], gas: 3000000}).then(function() {
    			done("Referee was added from a non admin account, error!");
    		});
    	});
    }).catch(function(err) {
    	//Expected
    	done();
  	});
  }));
  
  it("should be able to join a league", redeploy(accounts[0], function(done, leagueAgg){    
    var participantName =  "Tottenham Hotspur";
    	
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1000000}).then(function() {
    			return leagueAgg.doesLeagueContainParticipant.call(leagueIds[0], fromAscii(participantName)).then(function(doesExist) {
    				assert.equal(doesExist, true, "Participant has not been added to the league");
    				done();
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should not be able to join a league if the value of transaction is less then entry fee", redeploy(accounts[0], function(done, leagueAgg){    
    var participantName =  "Tottenham Hotspur";
    	
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 900000}).then(function() {
    			return leagueAgg.doesLeagueContainParticipant.call(leagueIds[0], fromAscii(participantName)).then(function(doesExist) {
    				assert.equal(doesExist, false, "Participant has been added to the league incorrectly");
    				done();
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should be able to join a league if the transaction value is higher than entry fee", redeploy(accounts[0], function(done, leagueAgg){    
    var participantName =  "Tottenham Hotspur";
    	
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1500000}).then(function() {
    			return leagueAgg.doesLeagueContainParticipant.call(leagueIds[0], fromAscii(participantName)).then(function(doesExist) {
    				assert.equal(doesExist, true, "Participant has not been added to the league");
    				done();
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should be able to add result (home win)", redeploy(accounts[0], function(done, leagueAgg){
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii("Tottenham Hotspur"), {from: accounts[1], gas: 3000000, value: 1000000}).then(function() {
    			return leagueAgg.joinLeague(leagueIds[0], fromAscii("Arsenal"), {from: accounts[2], gas: 3000000, value: 1000000}).then(function() {
    				return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetails) {
    					return leagueAgg.setResultAggregateAddress(accounts[3], {from: accounts[0], gas: 3000000}).then(function() {
    						//Participant ids
    						var partIds = leagueDetails[1];
    						return leagueAgg.addResult(leagueIds[0], partIds[0], 5, partIds[1], 1, {from: accounts[3], gas: 3000000}).then(function() {
    							return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetailsUpdated) {
    								var partScores = leagueDetailsUpdated[3];
    								assert.equal(partScores[0], 3, "Home team score not update correctly");
    								assert.equal(partScores[1], 0, "Away team score is not 0");
    								done();
    							});
    						});
    					});
    				});
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should be able to add result (draw)", redeploy(accounts[0], function(done, leagueAgg){
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii("Tottenham Hotspur"), {from: accounts[1], gas: 3000000, value: 1000000}).then(function() {
    			return leagueAgg.joinLeague(leagueIds[0], fromAscii("Arsenal"), {from: accounts[2], gas: 3000000, value: 1000000}).then(function() {
    				return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetails) {
    					return leagueAgg.setResultAggregateAddress(accounts[3], {from: accounts[0], gas: 3000000}).then(function() {
    						//Participant ids
    						var partIds = leagueDetails[1];
    						return leagueAgg.addResult(leagueIds[0], partIds[0], 2, partIds[1], 2, {from: accounts[3], gas: 3000000}).then(function() {
    							return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetailsUpdated) {
    								var partScores = leagueDetailsUpdated[3];
    								assert.equal(partScores[0], 1, "Home team score not update correctly");
    								assert.equal(partScores[1], 1, "Away team score not update correctly");
    								done();
    							});
    						});
    					});
    				});
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should not be allowed to add a result from any address other than the result aggregate", redeploy(accounts[0], function(done, leagueAgg){
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii("Tottenham Hotspur"), {from: accounts[1], gas: 3000000, value: 1000000}).then(function() {
    			return leagueAgg.joinLeague(leagueIds[0], fromAscii("Arsenal"), {from: accounts[2], gas: 3000000, value: 1000000}).then(function() {
    				return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetails) {
    					return leagueAgg.setResultAggregateAddress(accounts[3], {from: accounts[0], gas: 3000000}).then(function() {
    						//Participant ids
    						var partIds = leagueDetails[1];
    						return leagueAgg.addResult(leagueIds[0], partIds[0], 2, partIds[1], 2, {from: accounts[0], gas: 3000000}).then(function() {
    							done("Adding result did not cause an error");
    						});
    					});
    				});
    			});
    		});
    	});
    }).catch(function(err) {
    	//This is what we expect
    	done();
  	});
  }));
  
  it("should be able to retrieve a leagues details", redeploy(accounts[0], function(done, leagueAgg){
    leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, {from: accounts[0], gas: 3000000}).then(function() {
    	return leagueAgg.getLeaguesForAdmin.call(accounts[0]).then(function(leagueIds) {
    		return leagueAgg.joinLeague(leagueIds[0], fromAscii("Tottenham Hotspur"), {from: accounts[1], gas: 3000000, value: 1000000}).then(function() {
    			return leagueAgg.joinLeague(leagueIds[0], fromAscii("Arsenal"), {from: accounts[2], gas: 3000000, value: 1000000}).then(function() {
    				return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetails) {
    					return leagueAgg.setResultAggregateAddress(accounts[3], {from: accounts[0], gas: 3000000}).then(function() {
    						//Participant ids
    						var partIds = leagueDetails[1];
    						return leagueAgg.addResult(leagueIds[0], partIds[0], 5, partIds[1], 1, {from: accounts[3], gas: 3000000}).then(function() {
    							return leagueAgg.getLeagueDetails.call(leagueIds[0]).then(function(leagueDetailsUpdated) {
    								var name = leagueDetailsUpdated[0];
    								assert.equal(toAscii(name), "Test League", "League name not returned correctly");
    								
    								var partIds = leagueDetailsUpdated[1];
    								assert.equal(partIds.length, 2, "Participant ids not returned correctly");
    								
    								var partNames = leagueDetailsUpdated[2];
    								assert.equal(toAscii(partNames[0]), "Tottenham Hotspur", "First participant name not returned correctly");
    								assert.equal(toAscii(partNames[1]), "Arsenal", "Second participant name not returned correctly");
    								
    								var partScores = leagueDetailsUpdated[3];
    								assert.equal(partScores[0], 3, "Home team score not updated correctly");
    								assert.equal(partScores[1], 0, "Away team score is not 0");
    								done();
    							});
    						});
    					});
    				});
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
});

function redeploy(deployer, testFunction) {

	var wrappedFunction = function(done) {
		LeagueAggregate.new({ from: deployer }).then(function (newLeagueAggregate) {
			testFunction(done, newLeagueAggregate);
    	});
	}
	
	return wrappedFunction;
}

function fromAscii(str, padding) {
    var hex = '0x';
    for (var i = 0; i < str.length; i++) {
        var code = str.charCodeAt(i);
        var n = code.toString(16);
        hex += n.length < 2 ? '0' + n : n;
    }
    return hex + '0'.repeat(padding*2 - hex.length + 2);
}

function toAscii(hex) {
    var str = '',
        i = 0,
        l = hex.length;
    if (hex.substr(0, 2) === '0x') {
        i = 2;
    }
    for (; i < l; i+=2) {
        var code = parseInt(hex.substr(i, 2), 16);
        if (code === 0) continue; // this is added
        str += String.fromCharCode(code);
    }
    return str;
}