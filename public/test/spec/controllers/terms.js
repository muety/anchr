'use strict';

describe('Controller: TermsCtrl', function () {

  // load the controller's module
  beforeEach(module('anchrClientApp'));

  var TermsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TermsCtrl = $controller('TermsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(TermsCtrl.awesomeThings.length).toBe(3);
  });
});
