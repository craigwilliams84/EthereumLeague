angular = require('angular');
require('angular-route');
require('angular-sanitize');
require('angular-animate');
require('angular-ui-bootstrap');
require('ui-select');

angular.module('EtherLeagueServices', []);
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