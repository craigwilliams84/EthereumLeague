require('./appConfig.js');

lightwallet = require('eth-lightwallet');
Web3 = require('web3');
HookedWeb3Provider = require('hooked-web3-provider');

require('accounts/AccountsService');
require('home/LoginService');
require('league/LeagueAggregateService');
require('result/ResultAggregateService');
require('messages/MessagesService');
require('modal/ModalService');
require('bank/BankService');

require('home/EtherLeagueController');
require('create/CreateLeagueController');
require('bank/BankController');
require('search/SearchLeaguesController');
require('leaguedetails/LeagueDetailsController');
require('leaguelist/LeagueListControllerCommon');
require('myleagues/MyLeaguesController');
require('leaguedetails/AddRefereeModalController');
require('leaguedetails/AddResultModalController');
require('leaguedetails/PendingResultModalController');
require('home/LoginModalController');
