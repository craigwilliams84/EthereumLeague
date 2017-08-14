require('angular').module('EtherLeagueServices').service('accountsService', [function() {

  var accounts = [];
  var account = "";
  var loggedIn = true;

  this.getBalance = function(callback) {

    web3.eth.getBalance(accounts[0], function(error, result) {

      callback(error, web3.fromWei(result,"ether"));
    });
  };

  this.getMainAccount = function() {
    return accounts[0];
  };

  this.login = function(loginStrategy) {
    return loginStrategy()
      .then(function() {
        accounts = web3.eth.accounts;
        account = "0x" + accounts[0];
        console.log("Your account is " + accounts[0]);

        LeagueAggregate.setProvider(web3.currentProvider);
        ResultAggregate.setProvider(web3.currentProvider);

        loggedIn = true;
      });
  };

}]);