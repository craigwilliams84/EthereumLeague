module.exports = function(deployer) {
  deployer.deploy(LeagueAggregate).then(function() {
  	deployer.deploy(ResultAggregate, LeagueAggregate.address);
  });
  
};
