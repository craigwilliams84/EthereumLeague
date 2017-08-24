var Bank = artifacts.require("Bank.sol");

contract('Bank', function(accounts) {

	const FUNDS_TO_ADD = 1000000000;
  
  it("should be able to set the league contract address via the owner account", redeploy(accounts[0], function(done, bank){

		bank.setLeagueContractAddress(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				done();
			})
			.catch(function(err) {
				done(err)
			});
  }));

	it("should not allow the league contract address to be set from non owner account", redeploy(accounts[0], function(done, bank){

		bank.setLeagueContractAddress(accounts[1], {from: accounts[2], gas: 3000000})
			.then(function() {
				done("Contract address incorrectly set from non owner account");
			})
			.catch(function(err) {
				//Expect an error
				done();
			});
	}));

	it("should add funds when called from league contract", redeploy(accounts[0], function(done, bank){

		addFunds(bank)
			.then(function() {
				return bank.getAvailableFunds.call({from: accounts[2]});
			})
			.then(function(availableFunds){
				assert.equal(availableFunds, FUNDS_TO_ADD);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should not allow addFunds to be called from non league contract", redeploy(accounts[0], function(done, bank){

		addFunds(bank, accounts[3])
			.then(function() {
				done("Add funds called from non league contract");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	it("should allow funds to be withdrawn", redeploy(accounts[0], function(done, bank){

		addFunds(bank)
			.then(function() {
				var fundsBefore= web3.eth.getBalance(accounts[2]);
				return bank.withdrawFunds({from: accounts[2], gas: 3000000, gasPrice: 1})
					.then(function(result) {
						var fundsAfter = web3.eth.getBalance(accounts[2]);
						var gasUsed = result.receipt.gasUsed;
						assert.equal(fundsAfter.toString(), fundsBefore.plus(FUNDS_TO_ADD - gasUsed).toString(), "Funds not transferred correctly");
						done();
					})
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should zero available funds after withdrawal", redeploy(accounts[0], function(done, bank){

		addFunds(bank)
			.then(function() {
				return bank.withdrawFunds({from: accounts[2], gas: 3000000, gasPrice: 1})
			})
			.then(function() {
				return bank.getAvailableFunds.call({from: accounts[2]});
			})
			.then(function(availableFunds) {
				assert(availableFunds, 0);
				done();
			})
			.catch(function(err) {
				done(err);
			});
	}));

	it("should throw if withdrawFunds is called when no funds are available", redeploy(accounts[0], function(done, bank){

		bank.withdrawFunds({from: accounts[2], gas: 3000000, gasPrice: 1})
			.then(function() {
				done("An error was expected when calling withdrawFunds without a balance");
			})
			.catch(function(err) {
				//Error expected
				done();
			});
	}));

	var addFunds = function(bank, fromAccount) {
		if (!fromAccount) {
			fromAccount = accounts[1];
		}
		return bank.setLeagueContractAddress(accounts[1], {from: accounts[0], gas: 3000000})
			.then(function() {
				return bank.addFunds(accounts[2], {value: FUNDS_TO_ADD, from: fromAccount, gas: 3000000});
			})
	};

});

function redeploy(deployer, testFunction) {

	var wrappedFunction = function(done) {
		Bank.new({ from: deployer }).then(function (newBank) {
			testFunction(done, newBank);
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