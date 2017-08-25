contract = require("truffle-contract");
bankContract = require("../../../build/contracts/Bank.json");
Bank = contract(bankContract);

require('angular').module('EtherLeagueServices').service('bankService', ['accountsService', function(accountsService) {
  this.getAvailableFunds = function() {
    return getBankContract()
      .then(function(bank) {
        return bank.getAvailableFunds.call({from: accountsService.getMainAccount()});
      });
  };

  this.withdrawFunds = function() {
    return getBankContract()
      .then(function(bank) {
        return bank.withdrawFunds({
          from: accountsService.getMainAccount(),
          gas: 3000000
        });
      })
  };

  var getBankContract = function() {
    return Bank.deployed();
  };
}]);