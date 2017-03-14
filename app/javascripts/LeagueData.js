angular.module('EtherLeagueServices').service('leagueData', [function() {
  var leagueDetails = {};

  this.put = function(id, league) {
    leagueDetails[id] = league;
  }

  this.get = function(id) {
    return leagueDetails[id];
  }

}]);