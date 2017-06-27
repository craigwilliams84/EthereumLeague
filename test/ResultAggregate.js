contract('ResultAggregate', function(accounts) {

  it("should be able to add a new result", mockRedeploy(true, true, function(done, resultAgg){    	
    resultAgg.addResult(1, 2, 3, 4, 5, {from: accounts[0], gas: 3000000}).then(function() {
    	return resultAgg.getPendingResultIds.call(1).then(function(resultIds) {
    		assert.equal(resultIds.length, 1, "Result not added correctly");
    		done();
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should not be able to add a new result if not referee", mockRedeploy(true, false, function(done, resultAgg){    	
    resultAgg.addResult(1, 2, 3, 4, 5, {from: accounts[0], gas: 3000000}).then(function() {
    	done("Result was added successfully when it should have failed");
    }).catch(function(err) {
    	//Expected
    	done();
  	});
  }));
  
  it("should be able to get result details", mockRedeploy(true, true, function(done, resultAgg){    	
    resultAgg.addResult(1, 2, 3, 4, 5, {from: accounts[0], gas: 3000000}).then(function() {
    	return resultAgg.getPendingResultIds.call(1).then(function(resultIds) {
    		return resultAgg.getResultDetails.call(1, resultIds[0]).then(function(resultDetails) {
    			assert.equal(resultDetails[0], 0, "Status not set correctly");
    			assert.equal(resultDetails[1], 2, "Home participant id not set correctly");
    			assert.equal(resultDetails[2], 3, "Home score not set correctly");
    			assert.equal(resultDetails[3], 4, "Away participant id not set correctly");
    			assert.equal(resultDetails[4], 5, "Away score not set correctly");
    			done();
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should be able to accept result first", mockRedeploy(true, true, function(done, resultAgg){    	
    resultAgg.addResult(1, 2, 3, 4, 5, {from: accounts[0], gas: 3000000}).then(function() {
    	return resultAgg.getPendingResultIds.call(1).then(function(resultIds) {
    		return resultAgg.acceptResult(1, resultIds[0], {from: accounts[0], gas: 3000000}).then(function() {
    			return resultAgg.getResultDetails.call(1, resultIds[0]).then(function(resultDetails) {
    				assert.equal(resultDetails[0], 0, "Status incorrectly changed");
    				assert.equal(resultDetails[5], accounts[0], "Acted value not set correctly");
    				done();
    			});
    		});
    	});
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should be able to accept result second", mockRedeploy(true, true, function(done, resultAgg){    	
    resultAgg.addResult(1, 2, 3, 4, 5, {from: accounts[0], gas: 3000000}).then(function() {
    	return resultAgg.getPendingResultIds.call(1)
    }).then(function(resultIds) {
    		return resultAgg.acceptResult(1, resultIds[0], {from: accounts[0], gas: 3000000}).then(function() {
    			return resultAgg.acceptResult(1, resultIds[0], {from: accounts[1], gas: 3000000})
        }).then(function() {
    				return resultAgg.getResultDetails.call(1, resultIds[0])
        }).then(function(resultDetails) {
    					assert.equal(resultDetails[0], 2, "Status not changed correctly (to accepted)");
    					done();
        });
    }).catch(function(err) {
    	done(err);
  	});
  }));
  
  it("should not be able to accept result if the sender does not match a participant address", mockRedeploy(false, true, function(done, resultAgg){    	
    resultAgg.addResult(1, 2, 3, 4, 5, {from: accounts[0], gas: 3000000}).then(function() {
    	return resultAgg.getPendingResultIds.call(1).then(function(resultIds) {
    		return resultAgg.acceptResult(1, resultIds[0], {from: accounts[0], gas: 3000000}).then(function() {
    			done("Result was accepted by non participant address");
    		});
    	});
    }).catch(function(err) {
    	//Expected
    	done();
  	});
  }));
});

function mockRedeploy(isParticipantAddress, isReferee, testFunction) {
	var wrappedFunction = function(done) {
		MockLeagueAggregate.new(isParticipantAddress, isReferee).then(function (leagueAggregate) {
			ResultAggregate.new(leagueAggregate.address).then(function (newResultAggregate) {
				testFunction(done, newResultAggregate);
    		});
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