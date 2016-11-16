'use strict';

describe('Controller: ApiCtrl', function () {

  // load the controller's module
  beforeEach(module('anchrClientApp'));

  var ApiCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ApiCtrl = $controller('ApiCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ApiCtrl.awesomeThings.length).toBe(3);
  });
});
