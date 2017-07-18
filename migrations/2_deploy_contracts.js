var LeagueAggregate = artifacts.require("LeagueAggregate.sol");
var ResultAggregate = artifacts.require("ResultAggregate.sol");

module.exports = function(deployer) {
  deployer.deploy(LeagueAggregate)
    .then(function() {
      console.log("LeagueAggregate address: " + LeagueAggregate.address);
      return deployer.deploy(ResultAggregate, LeagueAggregate.address)
    })
    .then(function() {
      console.log("ResultAggregate address: " + ResultAggregate.address);
      return LeagueAggregate.deployed();
    })
    .then(function(leagueAggregate) {
      console.log("Setting LeagueAggregate address on ResultAggregate");
      return leagueAggregate.setResultAggregateAddress(ResultAggregate.address);
    })
};
