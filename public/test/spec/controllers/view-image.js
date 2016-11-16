'use strict';

describe('Controller: ViewImageCtrl', function () {

  // load the controller's module
  beforeEach(module('anchrClientApp'));

  var ViewImageCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ViewImageCtrl = $controller('ViewImageCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ViewImageCtrl.awesomeThings.length).toBe(3);
  });
});
