require('../js/appConfig');
require('../js/services/ModalService');
require('angular-mocks/ngMock');

describe('ModalService', function() {
  var service, mockUibModal;


  beforeEach(angular.mock.module('EtherLeagueServices', function($provide) {
    mockUibModal = {
      open: jasmine.createSpy()
    };

    $provide.value('$uibModal', mockUibModal);
  }));

  beforeEach(function() {
    inject(function($injector) {
      service = $injector.get('modalService');
    });
  });

  describe('openModal', function() {
    it('opens modal via $uibModal', function() {
      service.openModal("name");
      expect(mockUibModal.open).toHaveBeenCalled();
    });

    it('sets template url based on name', function() {
      service.openModal("modalName");
      var args = mockUibModal.open.calls.mostRecent().args[0];
      expect(args.templateUrl).toEqual("modalName.html");
    });

    it('sets controller based on name', function() {
      service.openModal("modalName");
      var args = mockUibModal.open.calls.mostRecent().args[0];
      expect(args.controller).toEqual("modalNameCtrl");
    });
  });
});

