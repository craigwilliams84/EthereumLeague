require('angular').module('EtherLeagueServices').service('loginService', [function() {

  this.metamaskLogin = function() {
    return new Promise(function(resolve, reject) {
      if(typeof web3 !== 'undefined') {
        console.log("Metamask or equivalent found");
        web3 = new Web3(web3.currentProvider);
        resolve(web3.eth.accounts);
      } else {
        reject("Web3 has not been injected");
      }
    });
  };

  this.mnemonicLogin = function() {
    return new Promise(function(resolve, reject) {
      var seed = prompt('Enter your private key seed', 'edge add ketchup champion panda pink basket develop trash capable arena fault');
      // the seed is stored in memory and encrypted by this user-defined password
      var password = prompt('Enter password to encrypt the seed', 'dev_password');

      lightwallet.keystore.deriveKeyFromPassword(password, function(err, _pwDerivedKey) {
        pwDerivedKey = _pwDerivedKey;
        ks = new lightwallet.keystore(seed, pwDerivedKey);

        // Create a custom passwordProvider to prompt the user to enter their
        // password whenever the hooked web3 provider issues a sendTransaction
        // call.
        ks.passwordProvider = function(callback) {
          var pw = prompt("Please enter password to sign your transaction", "dev_password");
          callback(null, pw);
        };

        //TODO need to obtain host via config
        var provider = new HookedWeb3Provider({
          host: "http://localhost:8545",
          transaction_signer: ks
        });

        web3 = new Web3(provider);

        // Generate the first address out of the seed
        ks.generateNewAddress(pwDerivedKey);

        resolve(ks.getAddresses());
      });
    });
  };

}]);