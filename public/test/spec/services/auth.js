'use strict';

describe('Service: Auth', function () {

  // load the service's module
  beforeEach(module('anchrClientApp'));

  // instantiate service
  var Auth;
  beforeEach(inject(function (_Auth_) {
    Auth = _Auth_;
  }));

  it('should do something', function () {
    expect(!!Auth).toBe(true);
  });

});
