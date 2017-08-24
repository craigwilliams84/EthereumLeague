require('appConfig');
require('./LeagueAggregateService');
require('angular-mocks/ngMock');

describe('LeagueAggregateService', function() {
  var service, mockAccountsService, mockLeagueAggregate;

  beforeEach(angular.mock.module('EtherLeagueServices', function($provide) {
    mockAccountsService = {
      getMainAccount: jasmine.createSpy().and.returnValue("4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4")
    };

    mockLeagueAggregate = {
    };
    
    web3 = {
      fromAscii: (asciiValue) => { return [asciiValue, "to bytes"] },
      toAscii: (arrayValue) => { return arrayValue[0] + " to ascii" },
      toWei: (value) => { return value * 1000000000000000000 },
      fromWei: (value) => { return value / 1000000000000000000 }
    }

    $provide.value('accountsService', mockAccountsService);
    LeagueAggregate.deployed = function() {
      return new Promise(function(resolve) {
        resolve(mockLeagueAggregate);
      });
    };
  }));

  beforeEach(function() {
    inject(function($injector) {
      service = $injector.get('leagueAggregateService');
    });
  });

  describe('addLeague', function() {

    beforeEach(function() {
      mockLeagueAggregate.addLeague = jasmine.createSpy();
    });

    it('delegates to league aggregate with correct values', function(done) {
      service.addLeague("Team Name", 3, 1, 5, 10, 2)
        .then(function() {
          expect(mockLeagueAggregate.addLeague).toHaveBeenCalledWith(["Team Name", "to bytes"], 3, 1, web3.toWei(5), 10, 2, jasmine.anything());
          done();
        })
        .catch(done.fail);
    });
  });

  describe('joinLeague', function() {

    beforeEach(function() {
      mockLeagueAggregate.joinLeague = jasmine.createSpy();
    });

    it('delegates to league aggregate with correct values', function(done) {
      service.joinLeague({id: 123}, "Team name")
        .then(function() {
          expect(mockLeagueAggregate.joinLeague).toHaveBeenCalledWith(123, ["Team name", "to bytes"], jasmine.anything());
          done();
        })
        .catch(done.fail);
    });

    it('sends the entry fee amount in transaction', function(done) {
      service.joinLeague({id: 123, entryFee: 100000}, "Team name")
        .then(function() {
          var txArgs = mockLeagueAggregate.joinLeague.calls.mostRecent().args[2];
          expect(txArgs.value).toEqual(100000);
;         done();
        })
        .catch(done.fail);
    });
  });

  describe('addReferee', function() {

    beforeEach(function() {
      mockLeagueAggregate.addRefereeToLeague = jasmine.createSpy();
    });

    it('delegates to league aggregate with correct values', function(done) {
      service.addReferee(123, '0x4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4')
        .then(function() {
          expect(mockLeagueAggregate.addRefereeToLeague).toHaveBeenCalledWith(123, '0x4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4', jasmine.anything());
          done();
        })
        .catch(done.fail);
    });
  });

  describe('withdrawFunds', function() {

    beforeEach(function() {
      mockLeagueAggregate.withdrawFunds = jasmine.createSpy();
    });

    it('delegates to league aggregate with correct values', function(done) {
      service.withdrawFunds()
        .then(function() {
          expect(mockLeagueAggregate.withdrawFunds).toHaveBeenCalledWith(jasmine.anything());
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getMyLeagues', function() {

    beforeEach(function() {

      web3.eth = {
        getBlockNumber: jasmine.createSpy().and.returnValue(5555)
      };

      mockLeagueAggregate.getLeaguesForAdmin = {
        call: jasmine.createSpy().and.returnValue([1, 2])
      };

      mockLeagueAggregate.getLeagueDetails = {
        call: (id) => {
          return new Promise((resolve) => resolve(
            [
              ["League with ID: " + id,"as array"],
              [1, 2],
              [["Spurs", "as array"], ["Arsenal", "as array"]],
              [12, 2],
              5000000000000000000,
              1
            ]));
        }
      };

      mockLeagueAggregate.OnLeagueAdded = jasmine.createSpy().and.returnValue(
        {
          get: (callback) => {
            callback(undefined, [{args: {leagueId: 1}}, {args: {leagueId: 2}}]);
          }
        }
      );

      mockLeagueAggregate.OnLeagueJoined = jasmine.createSpy().and.returnValue(
        {
          get: (callback) => {
            callback(undefined, [{args: {leagueId: 2}}, {args: {leagueId: 3}}]);
          }
        }
      );

      mockLeagueAggregate.OnRefereeAdded = jasmine.createSpy().and.returnValue(
        {
          get: (callback) => {
            callback(undefined, [{args: {leagueId: 3}}, {args: {leagueId: 4}}]);
          }
        }
      );
    });

    it('obtains ids for admin leagues from OnLeagueAdded events', function(done) {
      service.getMyLeagues()
        .then(function(myLeagues) {
          expect(mockLeagueAggregate.OnLeagueAdded).toHaveBeenCalled();
          var args = mockLeagueAggregate.OnLeagueAdded.calls.mostRecent().args[0];

          expect(args.adminAddress).toEqual("0x" + "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4");
          checkCommonEventArgs(mockLeagueAggregate.OnLeagueAdded.calls.mostRecent().args[1]);
          done();
        })
        .catch(done.fail);
    });

    it('obtains ids for referee leagues from OnRefereeAdded events', function(done) {
      service.getMyLeagues()
        .then(function(myLeagues) {
          expect(mockLeagueAggregate.OnRefereeAdded).toHaveBeenCalled();
          var args = mockLeagueAggregate.OnRefereeAdded.calls.mostRecent().args[0];

          expect(args.refereeAddress).toEqual("0x" + "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4");
          checkCommonEventArgs(mockLeagueAggregate.OnRefereeAdded.calls.mostRecent().args[1]);
          done();
        })
        .catch(done.fail);
    });

    it('obtains ids for referee leagues from OnLeagueJoined events', function(done) {
      service.getMyLeagues()
        .then(function(myLeagues) {
          expect(mockLeagueAggregate.OnLeagueJoined).toHaveBeenCalled();
          var args = mockLeagueAggregate.OnLeagueJoined.calls.mostRecent().args[0];

          expect(args.participantAddress).toEqual("0x" + "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4");
          checkCommonEventArgs(mockLeagueAggregate.OnLeagueJoined.calls.mostRecent().args[1]);
          done();
        })
        .catch(done.fail);
    });

    it('returns leagues correctly', function(done) {
      var expectedRoles =  {
        1: ["Admin"],
        2: ["Admin", "Participant"],
        3: ["Participant", "Referee"],
        4: ["Referee"]
      };

      service.getMyLeagues()
        .then(function(myLeagues) {
          myLeagues.forEach((league) => {
            expect(league.name).toEqual("League with ID: " + league.id + " to ascii");
            expect(league.participantIds).toEqual([1, 2]);
            expect(league.participantNames).toEqual(["Spurs to ascii", "Arsenal to ascii"]);
            expect(league.participantScores).toEqual([12, 2]);
            expect(league.entryFee).toEqual(5000000000000000000);
            expect(league.entryFeeForDisplay).toEqual('5');
            expect(league.prizeForDisplay).toEqual('10');
            expect(league.status).toEqual("IN PROGRESS");
            expect(league.userRoles).toEqual(expectedRoles[league.id]);
          });
          done();
        })
        .catch(done.fail);
    });
  });

  describe("getParticipantIdsInLeagueForUser", function() {
    beforeEach(function() {

      web3.eth = {
        getBlockNumber: jasmine.createSpy().and.returnValue(5555)
      };

      mockLeagueAggregate.OnLeagueJoined = jasmine.createSpy().and.returnValue(
        {
          get: (callback) => {
            callback(undefined, [{args: {participantId: 11}}, {args: {participantId: 16}}]);
          }
        }
      );
    });

    it("delegates to obtains ids for referee leagues from OnLeagueAdded events", function(done) {
      service.getParticipantIdsInLeagueForUser(123)
        .then(function(participantIds) {
          expect(mockLeagueAggregate.OnLeagueJoined).toHaveBeenCalled();
          var args = mockLeagueAggregate.OnLeagueJoined.calls.mostRecent().args[0];

          expect(args.leagueId).toEqual(123);
          expect(args.participantAddress).toEqual("0x" + "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4");
          checkCommonEventArgs(mockLeagueAggregate.OnLeagueJoined.calls.mostRecent().args[1]);
          done();
        })
        .catch(done.fail);
    });

    it("returns the league ids of the OnLeagueJoined events", function(done) {
      service.getParticipantIdsInLeagueForUser(123)
        .then(function(participantIds) {
          expect(participantIds).toEqual(['11', '16']);
          done();
        })
        .catch(done.fail);
    });
  });

  describe('getAvailableFunds', function() {

    beforeEach(function() {
      mockLeagueAggregate.getAvailableFunds = {call: jasmine.createSpy().and.returnValue(5000)};
    });

    it('delegates to league aggregate with correct values', function(done) {
      service.getAvailableFunds()
        .then(function() {
          expect(mockLeagueAggregate.getAvailableFunds.call).toHaveBeenCalledWith({from: "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4"});
          done();
        })
        .catch(done.fail);
    });

    it('delegates to league aggregate with correct values', function(done) {
      service.getAvailableFunds()
        .then(function() {
          expect(mockLeagueAggregate.getAvailableFunds.call).toHaveBeenCalledWith({from: "4d91838268f6d6D4e590e8fd2a001Cd91c32e7A4"});
          done();
        })
        .catch(done.fail);
    });
  });

  var checkCommonEventArgs = function(args) {
    expect(args.fromBlock).toEqual(0);
    expect(args.toBlock).toEqual(5555);
  };
});

