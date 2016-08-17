module.exports = function(deployer) {
  deployer.deploy(StringUtils);
  deployer.link(StringUtils, LeagueAggregate);
  deployer.deploy(LeagueAggregate).then(function() {
  	deployer.deploy(ResultAggregate, LeagueAggregate.address);
  });
  
};
