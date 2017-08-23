require('appConfig');
require('./ResultAggregateService');
require('angular-mocks/ngMock');

describe('ResultAggregateService', function() {
  var service, mockLeagueService, mockAccountsService, mockResultAggregate;

  beforeEach(angular.mock.module('EtherLeagueServices', function($provide) {
    mockLeagueService = {
    };

    mockAccountsService = {
      getMainAccount: jasmine.createSpy()
    };

    mockResultAggregate = {
    };

    $provide.value('leagueAggregateService', mockLeagueService);
    $provide.value('accountsService', mockAccountsService);
    ResultAggregate.deployed = function() {
      return new Promise(function(resolve) {
        resolve(mockResultAggregate);
      });
    };
  }));

  beforeEach(function() {
    inject(function($injector) {
      service = $injector.get('resultAggregateService');
    });
  });

  describe('addResult', function() {

    beforeEach(function() {
      mockResultAggregate.addResult = jasmine.createSpy();
    });

    it('delegates to result aggregate', function(done) {
      service.addResult(12, 34, 1, 56, 2)
        .then(function() {
          expect(mockResultAggregate.addResult).toHaveBeenCalledWith(12, 34, 1, 56, 2, jasmine.anything());
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getMyPendingResults', function() {

    beforeEach(function() {
      mockResultAggregate.getPendingResultIds = jasmine.createSpy()
        .and
        .returnValue(
          new Promise((resolve) => {
            resolve([1, 2, 3, 4]);
          })
        );

      mockResultAggregate.getResultDetails = {
        call: jasmine.createSpy()
          .and
          .callFake((leagueId, resultId) => {
            return [0, resultId * 2, resultId + 1, resultId * 2, resultId - 1, undefined];
          })
        };

      mockLeagueService.getParticipantIdsInLeagueForUser = jasmine.createSpy()
        .and
        .returnValue(new Promise((resolve) => { resolve(["2", "6"])}));
    });

    it('obtains pending result ids for passed in leagueId', function(done) {
      service.getMyPendingResults(123)
        .then(function() {
          expect(mockResultAggregate.getPendingResultIds).toHaveBeenCalledWith(123, jasmine.anything());
          done();
        })
        .catch(done.fail);
    });

    it('filters out results that are not associated to the user', function(done) {
      service.getMyPendingResults(123)
        .then(function(results) {
          expect(results.length).toEqual(2);
          expect(results[0].id).toEqual("1");
          expect(results[1].id).toEqual("3");
          done();
        })
        .catch(done.fail);
    });

    it('returns results in the correct format', function(done) {
      service.getMyPendingResults(123)
        .then(function(results) {
          validateResult(results[0],"1", 0, 2, 2, 2, 0);
          validateResult(results[1],"3", 0, 6, 4, 6, 2);
          done();
        })
        .catch(done.fail);
    });

    var validateResult = function(result, id, status, homePartId, homeScore, awayPartId, awayScore, actedAddress) {
      expect(result.id).toEqual(id);
      expect(result.status).toEqual(status);
      expect(result.homeParticipantId).toEqual(homePartId);
      expect(result.homeScore).toEqual(homeScore);
      expect(result.awayParticipantId).toEqual(awayPartId);
      expect(result.awayScore).toEqual(awayScore);
      expect(result.actedAddress).toEqual(actedAddress);
    };
  });

  describe('acceptResult', function() {

    beforeEach(function() {
      mockResultAggregate.acceptResult = jasmine.createSpy();
    });

    it('delegates to result aggregate', function(done) {
      service.acceptResult(12, 34)
        .then(function() {
          expect(mockResultAggregate.acceptResult).toHaveBeenCalledWith(12, 34, jasmine.anything());
          done();
        })
        .catch(done.fail);
    });
  });
});

