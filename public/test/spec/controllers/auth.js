'use strict';

describe('Controller: AuthCtrl', function () {

  // load the controller's module
  beforeEach(module('anchrClientApp'));

  var AuthCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AuthCtrl = $controller('AuthCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(AuthCtrl.awesomeThings.length).toBe(3);
  });
});
