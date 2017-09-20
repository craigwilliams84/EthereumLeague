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

	it("should allow the owner to add a voter when in PRE_VOTE state", redeploy(accounts[0], function(done, vote){
		vote.addVoter(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				var addedEvent = vote.VoterAdded({fromBlock: 0, toBlock: 'latest'});
				addedEvent.get(function(err, logs) {
					assert.equal(logs[0].args.voterAddress, accounts[1], "Voter not added correctly");
					done();
				});
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should error when the owner tries to add a voter when in IN_PROGRESS state", redeploy(accounts[0], function(done, vote){
		vote.startVote({from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.addVoter(accounts[1], {from: accounts[0], gas: 3000000});
			})
			.then(function() {
				done("Voter added successfully in incorrect state");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should error when a non owner tried to add a voter", redeploy(accounts[0], function(done, vote){
		vote.addVoter(accounts[1], {from: accounts[2], gas: 3000000})
			.then(function() {
				done("Voter added from non owner");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should consider account to be a voter after adding", redeploy(accounts[0], function(done, vote){
		vote.addVoter(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.isVoter.call(accounts[1]);
			})
			.then(function(isVoter){
				assert.equal(isVoter, true, "Account not considered to be a voter");
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should increment voter count after adding", redeploy(accounts[0], function(done, vote){
		vote.addVoter(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.voterCount.call();
			})
			.then(function(voterCount){
				assert.equal(voterCount, 1, "Voter count not updated correctly");
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should allow a registered voter to vote (APPROVE)", redeploy(accounts[0], function(done, vote){
		doSuccessfulVoteTest(done, vote, 0)
	}));

	it("should allow a registered voter to vote (DISAPPROVE)", redeploy(accounts[0], function(done, vote){
		doSuccessfulVoteTest(done, vote, 1)
	}));

	var doSuccessfulVoteTest = function(done, vote, voteValue) {
		startVote(vote)
			.then(function() {
				return vote.vote(accounts[1], voteValue, {from: accounts[4], gas: 3000000})
			})
			.then(function() {
				var addedEvent = vote.VoteAdded({fromBlock: 0, toBlock: 'latest'});
				addedEvent.get(function(err, logs) {
					assert.equal(logs[0].args.voterAddress, accounts[4], "Vote not added correctly; Incorrect voter address");
					assert.equal(logs[0].args.refereeAddress, accounts[1], "Vote not added correctly; Incorrect referee address");
					assert.equal(logs[0].args.vote, voteValue, "Vote not added correctly; Incorrect vote");
					done();
				});
			})
			.catch(function(err) {
				done(err);
			});
	};

	it("should not allow a non-registered voter to vote", redeploy(accounts[0], function(done, vote){
		startVote(vote)
			.then(function() {
				return vote.vote(accounts[1], {from: accounts[9], gas: 3000000})
			})
			.then(function() {
				done("Allowed a non registered voter to vote");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should not allow a vote for a non-registered candidate", redeploy(accounts[0], function(done, vote){
		startVote(vote)
			.then(function() {
				return vote.vote(accounts[6], {from: accounts[5], gas: 3000000})
			})
			.then(function() {
				done("Allowed a vote for a non registered candidate");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should not allow a vote when in PRE_VOTE status", redeploy(accounts[0], function(done, vote){
		populateVote(vote)
			.then(function() {
				return vote.vote(accounts[1], {from: accounts[4], gas: 3000000})
			})
			.then(function() {
				done("Allowed a vote in PRE_VOTE status");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should complete referee vote if duration exceeded after a vote has been added", redeploy(accounts[0], function(done, vote){
		startVote(vote)
			.then(function() {
				//86400 seconds in a day
				return increaseTime(86400);
			})
			.then(function() {
				return vote.vote(accounts[1], 0, {from: accounts[4], gas: 3000000});
			})
			.then(function() {
				return vote.status.call();
			})
			.then(function(status) {
				assert.equal(status, 2, "Vote not completed after duration exceeded");
				done();
			})
			.catch(function(err) {
				done(err);
			})
	}));

	it("should select referees that received approvals over the acceptance percentage", redeploy(accounts[0], function(done, vote){
		startVote(vote)
			.then(function() {
				return vote.vote(accounts[1], 0, {from: accounts[4], gas: 3000000})
			})
			.then(function() {
				return vote.vote(accounts[1], 1, {from: accounts[5], gas: 3000000});
			})
			.then(function() {
				return vote.vote(accounts[1], 1, {from: accounts[6], gas: 3000000});
			})
			.then(function() {
				return vote.vote(accounts[2], 1, {from: accounts[4], gas: 3000000})
			})
			.then(function() {
				return vote.vote(accounts[2], 0, {from: accounts[5], gas: 3000000});
			})
			.then(function() {
				return vote.vote(accounts[2], 0, {from: accounts[6], gas: 3000000});
			})
			.then(function() {
				return vote.vote(accounts[3], 0, {from: accounts[4], gas: 3000000})
			})
			.then(function() {
				return vote.vote(accounts[3], 0, {from: accounts[5], gas: 3000000});
			})
			.then(function() {
				return vote.vote(accounts[3], 0, {from: accounts[6], gas: 3000000});
			})
			.then(function() {
				//86400 seconds in a day
				return increaseTime(86400);
			})
			.then(function() {
				return vote.completeVoteIfDurationExceeded({from: accounts[6], gas: 3000000});
			})
			.then(function() {
				var acceptedEvent = vote.RefereeAccepted({fromBlock: 0, toBlock: 'latest'});
				acceptedEvent.get(function(err, logs) {
					assert.equal(logs[0].args.refereeAddress, accounts[2], "Account 2 not accepted");
					assert.equal(logs[1].args.refereeAddress, accounts[3], "Account 3 not accepted");
					assert.equal(logs.length, 2, "Incorrect number of referees accepted.");
					done();
				});
			})
			.catch(function(err) {
				done(err);
			})
	}));

	var populateVote = function(vote) {
		return vote.addCandidate(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				return vote.addCandidate(accounts[2], {from: accounts[0], gas: 3000000})
			})
			.then(function() {
				return vote.addCandidate(accounts[3], {from: accounts[0], gas: 3000000})
			})
			.then(function() {
				return vote.addVoter(accounts[4], {from: accounts[0], gas: 3000000})
			})
			.then(function() {
				return vote.addVoter(accounts[5], {from: accounts[0], gas: 3000000})
			})
			.then(function() {
				return vote.addVoter(accounts[6], {from: accounts[0], gas: 3000000})
			});
	}

	var startVote = function(vote) {
		return populateVote(vote)
			.then(function() {
				return vote.startVote( {from: accounts[0], gas: 3000000})
			});
	};

});

function increaseTime(increaseInSeconds) {
	return new Promise(function(resolve) {
		web3.currentProvider.sendAsync({
			jsonrpc: "2.0",
			method: "evm_increaseTime",
			params: [increaseInSeconds],  // 86400 seconds in a day
			id: new Date().getTime()
		}, resolve);
	});
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