require('appConfig');
require('./BankService');
require('angular-mocks/ngMock');

describe('BankService', function() {
  var service, mockAccountsService, mockBankContract;

  beforeEach(angular.mock.module('EtherLeagueServices', function($provide) {
    mockAccountsService = {
      getMainAccount: jasmine.createSpy().and.returnValue("4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4")
    };

    mockBankContract = {
    };

    $provide.value('accountsService', mockAccountsService);
    Bank.deployed = function() {
      return new Promise(function(resolve) {
        resolve(mockBankContract);
      });
    };
  }));

  beforeEach(function() {
    inject(function($injector) {
      service = $injector.get('bankService');
    });
  });

  describe('withdrawFunds', function() {

    beforeEach(function() {
      mockBankContract.withdrawFunds = jasmine.createSpy();
    });

    it('delegates to bank contract with correct values', function(done) {
      service.withdrawFunds()
        .then(function() {
          expect(mockBankContract.withdrawFunds).toHaveBeenCalledWith(jasmine.anything());
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getAvailableFunds', function() {

    beforeEach(function() {
      mockBankContract.getAvailableFunds = {call: jasmine.createSpy().and.returnValue(5000)};
    });

    it('delegates to bank contract with correct values', function(done) {
      service.getAvailableFunds()
        .then(function() {
          expect(mockBankContract.getAvailableFunds.call).toHaveBeenCalledWith({from: "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4"});
          done();
        })
        .catch(done.fail);
    });

    it('returns value returned from bank contract', function(done) {
      service.getAvailableFunds()
        .then(function(availableFunds) {
          expect(availableFunds).toEqual(5000);
          done();
        })
        .catch(done.fail);
    });
  });
});

