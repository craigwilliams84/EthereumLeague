var LeagueAggregate = artifacts.require("LeagueAggregate.sol");
var ResultAggregate = artifacts.require("ResultAggregate.sol");
var Bank = artifacts.require("Bank.sol");

module.exports = function(deployer) {
  deployer.deploy(LeagueAggregate)
    .then(function() {
      console.log("LeagueAggregate address: " + LeagueAggregate.address);
      return deployer.deploy(ResultAggregate, LeagueAggregate.address)
    })
    .then(function() {
      return deployer.deploy(Bank);
    })
    .then(function() {
      return Bank.deployed();
    })
    .then(function(bank) {
      console.log("Setting league aggregate address on Bank: " + LeagueAggregate.address);
      return bank.setLeagueContractAddress(LeagueAggregate.address);
    })
    .then(function() {
      return LeagueAggregate.deployed();
    })
    .then(function(leagueAggregate) {
      console.log("Setting result aggregate address on LeagueAggregate: " + ResultAggregate.address);
      return leagueAggregate.setResultAggregateAddress(ResultAggregate.address)
        .then(function() {
          console.log("Setting Bank address on LeagueAggregate: " + Bank.address);
          return leagueAggregate.setBankAddress(Bank.address)
        });
    })
};
