'use strict';

describe('Service: Shortlink', function () {

  // load the service's module
  beforeEach(module('anchrClientApp'));

  // instantiate service
  var Shortlink;
  beforeEach(inject(function (_Shortlink_) {
    Shortlink = _Shortlink_;
  }));

  it('should do something', function () {
    expect(!!Shortlink).toBe(true);
  });

});
