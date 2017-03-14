module.exports = {
  build: {
    "index.html": "index.html",
    "league.html": "league.html",
    "myLeagues.html": "myLeagues.html",
    "admin.html": "admin.html",
    "join.html": "join.html",
    "css/bootstrap.css": "css/bootstrap.css",
    "app.js": [
      "javascripts/app.js"
    ],
    "angular.js" :[
    	"javascripts/_vendor/angular.js",
    	"javascripts/_vendor/angular-route.js"
    ],	
    "jquery.js" :[
    	"javascripts/_vendor/jquery.js",
    ],
    "bootstrap.js" :[
    	"javascripts/_vendor/bootstrap.js",
    ],
    "AccountsService.js": "javascripts/AccountsService.js",
    "LeagueAggregateService.js": "javascripts/LeagueAggregateService.js",
    "LeagueListControllerCommon.js": "javascripts/LeagueListControllerCommon.js",
    "MyLeaguesController.js": "javascripts/MyLeaguesController.js",
    "AdminController.js": "javascripts/AdminController.js",
    "JoinLeagueController.js": "javascripts/JoinLeagueController.js",
    "LeagueData.js": "javascripts/LeagueData.js",
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
