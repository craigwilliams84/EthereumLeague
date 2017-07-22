angular = require('angular');
require('angular-route');
require('angular-sanitize');

require('angular-ui-bootstrap');

var app = angular.module('etherLeagueApp', ['ngRoute', 'EtherLeagueServices']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/myLeagues/', {
      templateUrl: 'myLeagues.html',
      controller: 'myLeaguesCtrl'
    }).when('/admin/', {
    templateUrl: 'admin.html',
    controller: 'adminCtrl'
  }).when('/join/', {
    templateUrl: 'join.html',
    controller: 'joinLeagueCtrl'
  }).when('/leagueDetails/:leagueId', {
    templateUrl: 'leagueDetails.html',
    controller: 'leagueDetailsCtrl'
  }).when('/bank/', {
    templateUrl: 'bank.html',
    controller: 'bankCtrl'
  }).otherwise({redirectTo: '/myLeagues/'});
  $locationProvider.html5Mode(false);
  $locationProvider.hashPrefix('');
}]);

lightwallet = require('eth-lightwallet');
Web3 = require('web3');
HookedWeb3Provider = require('hooked-web3-provider');

//Configure web3
if(typeof web3 === 'undefined')
  //TODO NEED TO GET THE HOST DYNAMICALLY!
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

require('AccountsService');
require('LeagueAggregateService');
require('LeagueCacheService');
require('ResultAggregateService');

require('EtherLeagueController');
require('AdminController');
require('BankController');
require('JoinLeagueController');
require('LeagueDetailsController');
require('LeagueListControllerCommon');
require('MyLeaguesController');

