var LeagueAggregate = artifacts.require("LeagueAggregate.sol");

contract('LeagueAggregate', function(accounts) {
  
  it("should be able to add a new league", function(done){
    LeagueAggregate.deployed()
			.then(function(deployed) {
				leagueAgg = deployed
				return addLeague(leagueAgg);
			})
			.then(function() {
				done();
			})
			.catch(function(err) {
				done(err);
			});
  });
  
  it("should be able to add a referee to a league", redeploy(accounts[0], function(done, leagueAgg){    	
    addLeague(leagueAgg)
			.then(function(leagueId) {
				return leagueAgg.addRefereeToLeague(leagueId, accounts[1], {from: accounts[0], gas: 3000000})
					.then((function() {
						return leagueAgg.isRefereeAddress.call(leagueId, accounts[1])
					}));
			})
			.then(function(isReferee) {
				assert.equal(isReferee, true, "Referee not added to the league correctly");
				done();
			})
			.catch(function(err) {
    		done(err);
  		});
  }));
  
  it("should not be able to add a referee to a league from non admin address", redeploy(accounts[0], function(done, leagueAgg){    	
    addLeague(leagueAgg).then(function() {
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

		addLeague(leagueAgg)
			.then(function(leagueId) {
				return leagueAgg.joinLeague(leagueId, fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1000000})
					.then(function() {
						return leagueAgg.doesLeagueContainParticipant.call(leagueId, fromAscii(participantName))
					})
			})
			.then(function(doesExist) {
				assert.equal(doesExist, true, "Participant has not been added to the league");
				done();
			})
			.catch(function(err) {
				done(err);
			});
  }));

	it("should be able to join a league and get refunded the excess when sending too much ether", redeploy(accounts[0], function(done, leagueAgg){
		var participantName =  "Tottenham Hotspur";

		addLeague(leagueAgg)
			.then(function(leagueId) {
				return leagueAgg.joinLeague(leagueId, fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1300000})
					.then(function() {
						return leagueAgg.doesLeagueContainParticipant.call(leagueId, fromAscii(participantName))
					})
			})
			.then(function(doesExist) {
				assert.equal(doesExist, true, "Participant has not been added to the league");
			})
			.then(function() {
				return leagueAgg.getAvailableFunds.call({from: accounts[1]});
			})
			.then(function(availableFunds) {
				assert.equal(availableFunds, 300000, "Excess funds not available to withdraw");
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should progress status to IN_PROGRESS (1) when league is full", redeploy(accounts[0], function(done, leagueAgg){
		addAndFillLeague(leagueAgg).then(function(leagueDetails) {
			assert.equal(leagueDetails.data[5], 1, "League status not set to IN_PROGRESS correctly");
			done();
		});
	}));

	it("should not allow participants to join when league is IN_PROGRESS", redeploy(accounts[0], function(done, leagueAgg){
		addLeague(leagueAgg).then(function() {
			return leagueAgg.getLeaguesForAdmin.call(accounts[0]);
		}).then(function(leagueIds) {
			return leagueAgg.joinLeague(leagueIds[0], fromAscii("Participant1"), {from: accounts[1], gas: 3000000, value: 1000000}).then(function(){
				return leagueAgg.joinLeague(leagueIds[0], fromAscii("Participant2"), {from: accounts[1], gas: 3000000, value: 1000000})
			}).then(function() {
				return leagueAgg.getLeagueDetails.call(leagueIds[0]);
			}).then(function(leagueDetails) {
				assert.equal(leagueDetails[5], 1, "League status not set to IN_PROGRESS correctly");
			}).then(function() {
				return leagueAgg.joinLeague(leagueIds[0], fromAscii("Participant3"), {from: accounts[1], gas: 3000000, value: 1000000})
				done("Adding participant when IN_PROGRESS did not error!");
			});
		}).catch(function(err) {
			//Error is expected
			done();
		});
	}));
  
  it("should be able to establish when a participant address is valid", redeploy(accounts[0], function(done, leagueAgg){
    var participantName =  "Tottenham Hotspur";

    addLeague(leagueAgg)
			.then(function(leagueId) {
    		return leagueAgg.joinLeague(leagueId, fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1000000})
					.then(function() {
						return leagueAgg.getLeagueDetails.call(leagueId)
					})
					.then(function(leagueDetails) {
						return leagueAgg.isParticipantAddress.call(leagueId, leagueDetails[1][0], accounts[1])
					});
			})
			.then(function(isParticipantAddress) {
				assert.equal(isParticipantAddress, true, "Invalid return value from isParticipantAddress");
				done();
			})
			.catch(function(err) {
				done(err);
			});
  }));
  
  it("should be able to establish when a participant address is invalid", redeploy(accounts[0], function(done, leagueAgg){    
    var participantName =  "Tottenham Hotspur";
    	
    addLeague(leagueAgg)
			.then(function(leagueId) {
    		return leagueAgg.joinLeague(leagueId, fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1000000})
					.then(function() {
						return leagueAgg.getLeagueDetails.call(leagueId)
					})
					.then(function(leagueDetails) {
						return leagueAgg.isParticipantAddress.call(leagueId, leagueDetails[1][0], accounts[2])
					});
    	})
			.then(function(isParticipantAddress) {
				assert.equal(isParticipantAddress, false, "Invalid return value from isParticipantAddress");
				done();
			})
    	.catch(function(err) {
    		done(err);
  		});
  }));
  
  it("should not be able to join a league if the value of transaction is less then entry fee", redeploy(accounts[0], function(done, leagueAgg){    
    var participantName =  "Tottenham Hotspur";
    	
    addLeague(leagueAgg)
			.then(function(leagueId) {
    		return leagueAgg.joinLeague(leagueId, fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 900000})
					.then(function() {
						return leagueAgg.doesLeagueContainParticipant.call(leagueId, fromAscii(participantName))
					});
    	})
			.then(function(doesExist) {
				assert.equal(doesExist, false, "Participant has been added to the league incorrectly");
				done();
			})
    	.catch(function(err) {
    		done(err);
  		});
  }));
  
  it("should be able to join a league if the transaction value is higher than entry fee", redeploy(accounts[0], function(done, leagueAgg){    
    var participantName =  "Tottenham Hotspur";
    	
    addLeague(leagueAgg)
			.then(function(leagueId) {
    		return leagueAgg.joinLeague(leagueId, fromAscii(participantName), {from: accounts[1], gas: 3000000, value: 1500000})
					.then(function() {
						return leagueAgg.doesLeagueContainParticipant.call(leagueId, fromAscii(participantName))
					});
			})
			.then(function(doesExist) {
				assert.equal(doesExist, true, "Participant has not been added to the league");
				done();
			})
    	.catch(function(err) {
    		done(err);
  		});
  }));
  
  it("should be able to add result (home win)", redeploy(accounts[0], function(done, leagueAgg){
    addAndFillLeague(leagueAgg)
			.then(function(leagueDetails) {
				//Participant ids
				var partIds = leagueDetails.data[1];
				return leagueAgg.addResult(leagueDetails.id, partIds[0], 5, partIds[1], 1, {from: accounts[3], gas: 3000000})
					.then(function() {
						return leagueAgg.getLeagueDetails.call(leagueDetails.id)
					});
			})
			.then(function(leagueDetailsUpdated) {
				var partScores = leagueDetailsUpdated[3];
				assert.equal(partScores[0], 3, "Home team score not update correctly");
				assert.equal(partScores[1], 0, "Away team score is not 0");
				done();
			})
			.catch(function(err) {
				done(err);
    	})
  }));

	it("should be able to add result (draw)", redeploy(accounts[0], function(done, leagueAgg){
		addAndFillLeague(leagueAgg)
			.then(function(leagueDetails) {
				//Participant ids
				var partIds = leagueDetails.data[1];
				return leagueAgg.addResult(leagueDetails.id, partIds[0], 2, partIds[1], 2, {from: accounts[3], gas: 3000000})
					.then(function() {
						return leagueAgg.getLeagueDetails.call(leagueDetails.id)
					});
			})
			.then(function(leagueDetailsUpdated) {
				var partScores = leagueDetailsUpdated[3];
				assert.equal(partScores[0], 1, "Home team score not update correctly");
				assert.equal(partScores[1], 1, "Away team score not update correctly");
				done();
			})
			.catch(function(err) {
				done(err);
			})
	}));
  
  it("should not be allowed to add a result from any address other than the result aggregate", redeploy(accounts[0], function(done, leagueAgg){
		addAndFillLeague(leagueAgg)
			.then(function(leagueDetails) {
				//Participant ids
				var partIds = leagueDetails.data[1];
				return leagueAgg.addResult(leagueIds[0], partIds[0], 2, partIds[1], 2, {from: accounts[3], gas: 3000000})
					.then(function() {
						done("Adding result did not cause an error");
					});
			})
    	.catch(function(err) {
    		//This is what we expect
    		done();
  		});
  }));

	it("should be able to complete league", redeploy(accounts[0], function(done, leagueAgg){
		completeLeague(leagueAgg)
			.then(function(leagueDetailsUpdated) {
				var status = leagueDetailsUpdated.data[5];
				assert.equal(status, 2, "Status not updated to completed");
				done();
			})
			.catch(function(err) {
				done(err);
			})
	}));

	it("should add withdrawable funds for league winner ", redeploy(accounts[0], function(done, leagueAgg){
		completeLeague(leagueAgg)
			.then(function() {
				return leagueAgg.getAvailableFunds.call({from: accounts[1]});
			})
			.then(function(availableFunds) {
				assert.equal(availableFunds, 2000000, "League winner funds not correct");
				done();
			})
			.catch(function(err) {
				done(err);
			})
	}));

	it("should not add withdrawable funds for league loser", redeploy(accounts[0], function(done, leagueAgg){
		completeLeague(leagueAgg)
			.then(function() {
				return leagueAgg.getAvailableFunds.call({from: accounts[2]});
			})
			.then(function(availableFunds) {
				assert.equal(availableFunds, 0, "League loser funds not correct");
				done();
			})
			.catch(function(err) {
				done(err);
			})
	}));

	it("should allow league winner to withdraw funds ", redeploy(accounts[0], function(done, leagueAgg){
		completeLeague(leagueAgg)
			.then(function() {
				var fundsBefore= web3.eth.getBalance(accounts[1]);
				return leagueAgg.withdrawFunds({from: accounts[1], gas: 3000000, gasPrice: 1})
					.then(function(result) {
						var fundsAfter= web3.eth.getBalance(accounts[1]);
						var gasUsed = result.receipt.gasUsed;
						assert.equal(fundsAfter.toString(), fundsBefore.plus(2000000 - gasUsed).toString(), "League winner funds transferred correctly");
						done();
					});
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should empty available funds after withdrawal ", redeploy(accounts[0], function(done, leagueAgg){
		completeLeague(leagueAgg)
			.then(function() {
				return leagueAgg.withdrawFunds({from: accounts[1], gas: 3000000, gasPrice: 1})
			})
			.then(function() {
				return leagueAgg.getAvailableFunds.call({from: accounts[1]});
			})
			.then(function(availableFunds) {
				assert.equal(availableFunds, 0, "League winner funds not emptied after withdrawal");
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));
  
  it("should be able to retrieve a leagues details", redeploy(accounts[0], function(done, leagueAgg){
		return leagueAgg.setResultAggregateAddress(accounts[3], {from: accounts[0], gas: 3000000})
			.then(function() {
				return addLeague(leagueAgg)
			})
			.then(function(leagueId) {
    		return leagueAgg.joinLeague(leagueId, fromAscii("Tottenham Hotspur"), {from: accounts[1], gas: 3000000, value: 1000000})
					.then(function() {
    				return leagueAgg.joinLeague(leagueId, fromAscii("Arsenal"), {from: accounts[2], gas: 3000000, value: 1000000})
					}).then(function() {
						return leagueAgg.getLeagueDetails.call(leagueId)
					}).then(function(leagueDetails) {
						//Participant ids
						var partIds = leagueDetails[1];
						return leagueAgg.addResult(leagueId, partIds[0], 5, partIds[1], 1, {from: accounts[3], gas: 3000000})
							.then(function() {
								return leagueAgg.getLeagueDetails.call(leagueId)
							});
    				});
			})
			.then(function(leagueDetailsUpdated) {
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

				assert.equal(leagueDetailsUpdated[4], 1000000, "Entry fee not returned correctly");

				assert.equal(leagueDetailsUpdated[5], 1, "League status not returned correctly");

				assert.equal(leagueDetailsUpdated[6], 2, "Number of entrants not returned correctly");

				assert.equal(leagueDetailsUpdated[7], 2, "Number of times particpiants play each other not returned correctly");
				done();
			})
    	.catch(function(err) {
    		done(err);
  		});
  }));

	function addLeague(leagueAgg) {
		return leagueAgg.addLeague(fromAscii("Test League", 32), 3, 1, 1000000, 2, 2, {from: accounts[0], gas: 3000000})
			.then(function() {
				return 0;
			});
	};

	function addAndFillLeague(leagueAgg) {
		return leagueAgg.setResultAggregateAddress(accounts[3], {from: accounts[0], gas: 3000000})
			.then(function() {
				return addLeague(leagueAgg);
			})
			.then(function(leagueId) {
				return leagueAgg.joinLeague(leagueId, fromAscii("Tottenham Hotspur"), {from: accounts[1], gas: 3000000, value: 1000000})
					.then(function() {
						return leagueAgg.joinLeague(leagueId, fromAscii("Arsenal"), {from: accounts[2], gas: 3000000, value: 1000000})
					})
					.then(function() {
						return leagueAgg.getLeagueDetails.call(leagueId)
					})
					.then(function(leagueDetails) {
						return {id: leagueId, data: leagueDetails};
					});
			});
	};

	function completeLeague(leagueAgg) {
		return addAndFillLeague(leagueAgg)
			.then(function(leagueDetails) {
				//Participant ids
				var partIds = leagueDetails.data[1];
				return leagueAgg.addResult(leagueDetails.id, partIds[0], 5, partIds[1], 1, {from: accounts[3], gas: 3000000})
					.then(function() {
						return leagueAgg.addResult(leagueDetails.id, partIds[1], 2, partIds[0], 2, {from: accounts[3], gas: 3000000})
					})
					.then(function() {
						return leagueAgg.getLeagueDetails.call(leagueDetails.id)
					})
					.then(function(leagueDetails) {
						return {id: leagueDetails.id, data: leagueDetails};
					});
			});
	};
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