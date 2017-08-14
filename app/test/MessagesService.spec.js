require('../js/appConfig');
require('../js/services/MessagesService');
require('angular-mocks/ngMock');

describe('MessagesService', function() {
  var service, $timeout;
  beforeEach(angular.mock.module('EtherLeagueServices'));

  beforeEach(function() {

    inject(function($injector) {
      service = $injector.get('messagesService');
    });

    inject(function(_$timeout_) {
      $timeout = _$timeout_;
    });
  });

  it('sets info message correctly', function() {
    service.setInfoMessage("the message");
    expectMessages("the message", "", "");
  });

  it('sets success message correctly', function() {
    service.setSuccessMessage("the message");
    expectMessages("", "the message", "");
  });

  it('sets error message correctly', function() {
    service.setErrorMessage("the message");
    expectMessages("", "", "the message");
  });

  it('clears messages correctly', function() {
    service.setInfoMessage("the message");
    expectMessages("the message", "", "");

    service.clearMessages();
    expectMessages("", "", "");
  });

  var expectMessages = function(info, success, error) {
    let messages = service.getMessages();

    $timeout.flush();
    expect(messages.infoMessage).toEqual(info);
    expect(messages.successMessage).toEqual(success);
    expect(messages.errorMessage).toEqual(error);
  };
});

