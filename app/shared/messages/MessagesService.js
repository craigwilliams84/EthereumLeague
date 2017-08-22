require('angular').module('EtherLeagueServices').service('messagesService', ['$rootScope', '$timeout', function($rootScope, $timeout) {

  var messages = {infoMessage: "", successMessage: "", errorMessage: ""};

  this.setInfoMessage = function(message) {
    setMessages(message, "", "");
  };

  this.setSuccessMessage = function(message) {
    setMessages("", message, "");
  };

  this.setErrorMessage = function(message) {
    setMessages("", "", message);
  };

  this.getMessages = function() {
    return messages;
  };

  this.clearMessages = function() {
    setMessages("", "", "");
  };

  var setMessages = function(info, success, error) {
    $timeout(function () {
      messages.infoMessage = info;
      messages.successMessage = success;
      messages.errorMessage = error;
    });

    $rootScope.$broadcast('messagesUpdated');
  };

}]);