var RefereeVote = artifacts.require("RefereeVote.sol");

const DURATION_IN_DAYS = 1;
const ACCEPTANCE_PERCENTAGE = 51;
const MAX_VOTERS = 3;

contract('RefereeVote', function(accounts) {
  
  it("should be able to add vote candidate when status is PRE_VOTE", redeploy(accounts[0], function(done, vote){
		vote.addCandidate(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				var addedEvent = vote.CandidateAdded({fromBlock: 0, toBlock: 'latest'});
				addedEvent.get(function(err, logs) {
					assert.equal(logs[0].args.candidateAddress, accounts[1], "Candidate not added correctly");
					done();
				});
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should not be be able to add vote candidate from non owner account", redeploy(accounts[0], function(done, vote){
		vote.addCandidate(accounts[1], {from: accounts[2], gas: 3000000})
			.then(function() {
				done("Adding a candidate from non owner account did not error");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should change status to IN_PROGRESS when vote started", redeploy(accounts[0], function(done, vote){
		vote.startVote({from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.status.call({from: accounts[0], gas: 3000000});
			})
			.then(function(status) {
				assert.equal(status, 1);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should not be be able to add vote candidate when status is PRE_VOTE", redeploy(accounts[0], function(done, vote){
		vote.startVote({from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.addCandidate(accounts[1], {from: accounts[0], gas: 3000000});
			})
			.then(function() {
				done("Adding a candidate when the vote has started did not error");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should error when starting vote when vote is already IN_PROGRESS", redeploy(accounts[0], function(done, vote){
		vote.startVote({from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.startVote({from: accounts[0], gas: 3000000})
			})
			.then(function() {
				done("Starting an already started vote did not error");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should error when starting vote from non owner account", redeploy(accounts[0], function(done, vote){
		vote.startVote({from: accounts[1], gas: 3000000})
			.then(function() {
				done("Starting an already started vote did not error");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

});

function increaseTime(increaseInSeconds) {
	web3.currentProvider.sendAsync({
		jsonrpc: "2.0",
		method: "evm_increaseTime",
		params: [increaseInSeconds],  // 86400 seconds in a day
		id: new Date().getTime()
	}, callback);
};

function redeploy(deployer, testFunction) {

	var wrappedFunction = function(done) {
		RefereeVote.new(DURATION_IN_DAYS, ACCEPTANCE_PERCENTAGE, MAX_VOTERS, {from: deployer, gas: 3000000})
			.then(function(newVote) {
				testFunction(done, newVote);
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