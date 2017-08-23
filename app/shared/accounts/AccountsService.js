require('angular').module('EtherLeagueServices').service('accountsService', [function() {

  var accounts = [];

  this.getBalance = function() {
    return new Promise(function(resolve, reject) {
      web3.eth.getBalance(accounts[0], function(error, result) {

        if (error) {
          reject(error);
        }

        resolve(web3.fromWei(result,"ether"));
      });
    });
  };

  this.getMainAccount = function() {
    return accounts[0];
  };

  this.login = function(loginStrategy) {
    return loginStrategy()
      .then(function(loggedInAccounts) {
        accounts = loggedInAccounts;
        console.log("Your account is " + accounts[0]);

        LeagueAggregate.setProvider(web3.currentProvider);
        ResultAggregate.setProvider(web3.currentProvider);
      });
  };

}]);