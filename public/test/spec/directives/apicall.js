'use strict';

describe('Directive: apiCall', function () {

  // load the directive's module
  beforeEach(module('anchrClientApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<api-call></api-call>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the apiCall directive');
  }));
});
