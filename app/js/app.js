require('./appConfig.js');

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
