var RefereeAggregate = artifacts.require("RefereeAggregate.sol");

contract('RefereeAggregate', function(accounts) {
  
  it("should be able to register a referee", redeploy(accounts[0], function(done, refereeAgg){

		doRegister(refereeAgg)
			.then(function() {
				return refereeAgg.getRefereeDetails.call(accounts[1])
			})
			.then(function(refereeDetails) {
				assert.equal(toAscii(refereeDetails[0]), "Bob Smith", "Referee not added correctly");
				done();
			})
			.catch(function(err) {
				done(err)
			});
	}));

	it("should not be able to register a referee twice with same address", redeploy(accounts[0], function(done, refereeAgg){

		doRegister(refereeAgg)
			.then(function() {
				return refereeAgg.register(web3.fromAscii("Joe Bloggs", 32), web3.fromAscii("Abertillery", 32), {from: accounts[1], gas: 3000000})
					.then(function() {
						done("Second registration did not fail");
					})
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should be able to register a second referee with a different address", redeploy(accounts[0], function(done, refereeAgg){

		doRegister(refereeAgg)
			.then(function() {
				return refereeAgg.register(web3.fromAscii("Joe Bloggs", 32), web3.fromAscii("Abertillery", 32), {from: accounts[2], gas: 3000000})
			})
			.then(function() {
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should set/get referee values correctly when registered", redeploy(accounts[0], function(done, refereeAgg){
		doRegister(refereeAgg)
			.then(function() {
				return refereeAgg.getRefereeDetails.call(accounts[1])
			})
			.then(function(refereeDetails) {
				assert.equal(toAscii(refereeDetails[0]), "Bob Smith", "Referee not added correctly");
				assert.equal(toAscii(refereeDetails[1]), "Cardiff", "Location not added correctly");
				assert.equal(refereeDetails[2], 0, "Trust rating not set to zero");
				done();
			})
			.catch(function(err) {
				done(err)
			});
	}));

  it("should consider a referee as registered for an address that has called register", redeploy(accounts[0], function(done, refereeAgg){

    doRegister(refereeAgg)
      .then(function() {
        return refereeAgg.isRegisteredReferee.call(accounts[1]);
      })
      .then(function(isRegistered) {
        assert.equal(isRegistered, true, "Referee not considered registered");
        done();
      })
      .catch(function(err) {
        done(err)
      });
  }));

  it("should not consider a referee as registered for an address that has not called register", redeploy(accounts[0], function(done, refereeAgg){

    doRegister(refereeAgg)
      .then(function() {
        return refereeAgg.isRegisteredReferee.call(accounts[2]);
      })
      .then(function(isRegistered) {
        assert.equal(isRegistered, false, "Referee considered as registered incorrectly");
        done();
      })
      .catch(function(err) {
        done(err)
      });
  }));

	var doRegister = function(refereeAgg) {
		return refereeAgg.register(fromAscii("Bob Smith", 32), fromAscii("Cardiff", 32), {from: accounts[1], gas: 3000000});
	}
});

function redeploy(deployer, testFunction) {

	var wrappedFunction = function(done) {
		RefereeAggregate.new({from: deployer, gas: 3000000}).then(function(newReferee) {
			testFunction(done, newReferee);
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