require('angular').module('EtherLeagueServices').service('leagueCacheService', [function() {
  var leagueDetails = {};

  this.put = function(id, league) {
    leagueDetails[id] = league;
  }

  this.get = function(id) {
    return leagueDetails[id];
  }

}]);