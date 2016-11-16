'use strict';

describe('Controller: ShortlinkCtrl', function () {

  // load the controller's module
  beforeEach(module('anchrClientApp'));

  var ShortlinkCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ShortlinkCtrl = $controller('ShortlinkCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(ShortlinkCtrl.awesomeThings.length).toBe(3);
  });
});
