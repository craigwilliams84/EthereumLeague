angular = require('angular');
require('angular-route');
require('angular-sanitize');
require('angular-animate');
require('angular-ui-bootstrap');
require('ui-select');

var app = angular.module('etherLeagueApp', ['ngRoute', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.select', 'EtherLeagueServices']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/myLeagues/', {
      templateUrl: 'myLeagues.html',
      controller: 'myLeaguesCtrl'
    }).when('/loginSuccess/', {
      redirectTo: '/myLeagues/'
    }).when('/create/', {
      templateUrl: 'create.html',
      controller: 'createLeagueCtrl'
    }).when('/search/', {
      templateUrl: 'search.html',
      controller: 'searchLeaguesCtrl'
    }).when('/leagueDetails/:leagueId', {
      templateUrl: 'leagueDetails.html',
      controller: 'leagueDetailsCtrl'
    }).when('/bank/', {
      templateUrl: 'bank.html',
      controller: 'bankCtrl'
    }).otherwise({redirectTo: '/'});
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
require('MessagesService');
require('ModalService');

require('EtherLeagueController');
require('CreateLeagueController');
require('BankController');
require('SearchLeaguesController');
require('LeagueDetailsController');
require('LeagueListControllerCommon');
require('MyLeaguesController');
require('AddRefereeModalController');
require('AddResultModalController');
require('PendingResultModalController');
