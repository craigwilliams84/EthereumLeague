module.exports = function(deployer) {
  deployer.deploy(LeagueAggregate)
    .then(function() {
      console.log("LeagueAggregate address: " + LeagueAggregate.address);
  	  deployer.deploy(ResultAggregate, LeagueAggregate.address).then(function() {
        console.log("ResultAggregate address: " + ResultAggregate.address);
        LeagueAggregate.deployed().setResultAggregateAddress(ResultAggregate.address);
      });
    });
};
