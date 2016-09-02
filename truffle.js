module.exports = {
  build: {
    "index.html": "index.html",
    "league.html": "league.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "angular.js" :[
    	"javascripts/_vendor/angular.js",
    	"javascripts/_vendor/angular-route.js"
    ],	
    "AccountsService.js": "javascripts/AccountsService.js",
    "LeagueAggregateService.js": "javascripts/LeagueAggregateService.js",
    "LeagueController.js": "javascripts/LeagueController.js",
    "etherLeague.js": [
      "javascripts/_vendor/lightwallet.js",
      "javascripts/_vendor/hooked-web3-provider.js",  
      "javascripts/etherLeagueController.js"
    ]
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
