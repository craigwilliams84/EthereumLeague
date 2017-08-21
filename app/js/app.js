require('./appConfig.js');

lightwallet = require('eth-lightwallet');
Web3 = require('web3');
HookedWeb3Provider = require('hooked-web3-provider');

require('AccountsService');
require('LoginService');
require('LeagueAggregateService');
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
require('LoginModalController');
