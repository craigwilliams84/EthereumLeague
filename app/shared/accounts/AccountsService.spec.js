require('appConfig');
require('./AccountsService');
require('angular-mocks/ngMock');

describe('AccountsService', function() {
  var service, $timeout;
  beforeEach(angular.mock.module('EtherLeagueServices'));

  beforeEach(function() {

    inject(function($injector) {
      service = $injector.get('accountsService');
    });

    web3 = {};
  });

  describe('login()', function() {
    var mockLoginStrategy = jasmine
      .createSpy()
      .and
      .returnValue(
        new Promise((resolve) => {
          resolve(['0x4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4', '0x4d91838268f6d6D4e590e8fd2a001Cd91c32eBBB'])
        })
      );

    beforeEach(function() {
      web3.currentProvider = {id: "mockProvider"};
      LeagueAggregate = {setProvider: jasmine.createSpy('setProvider')};
      ResultAggregate = {setProvider: jasmine.createSpy('setProvider')};
    });

    it('executes login strategy', function(done) {
      service.login(mockLoginStrategy)
        .then(function() {
          expect(mockLoginStrategy).toHaveBeenCalled();
          done();
        })
        .catch(done.fail);
    });

    it('sets main account to be the first address in accounts array', function(done) {
      service.login(mockLoginStrategy)
        .then(function() {
          expect(service.getMainAccount()).toEqual('0x4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4');
          done();
        })
        .catch(done.fail);
    });

    it('sets the web3 provider on contracts', function(done) {
      service.login(mockLoginStrategy)
        .then(function() {
          expect(LeagueAggregate.setProvider).toHaveBeenCalledWith(web3.currentProvider);
          expect(ResultAggregate.setProvider).toHaveBeenCalledWith(web3.currentProvider);
          done();
        })
        .catch(done.fail);
    });
  });
  
  describe('getBalance', function() {
    beforeEach(function() {
      web3.fromWei = jasmine.createSpy().and.returnValue(1);
      web3.eth = {getBalance: jasmine.createSpy()};

      web3.eth.getBalance.and.callFake(function(account, callback) {
        callback(undefined, 10000000);
      });
    });

    it('delegates to web3 getBalance', function(done) {
      service.getBalance()
        .then(function(balance) {
          expect(web3.eth.getBalance).toHaveBeenCalled();
          done()
        })
        .catch(done.fail);
    });

    it('returns correct balance in ether', function(done) {
      service.getBalance()
        .then(function(balance) {
          expect(web3.fromWei).toHaveBeenCalledWith(10000000, 'ether');
          expect(balance).toEqual(1);
          done()
        })
        .catch(done.fail);
    });
  });

});

