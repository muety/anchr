'use strict';

describe('Controller: CollectionCtrl', function () {

  // load the controller's module
  beforeEach(module('anchrClientApp'));

  var CollectionCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CollectionCtrl = $controller('CollectionCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(CollectionCtrl.awesomeThings.length).toBe(3);
  });
});
