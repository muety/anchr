'use strict';

describe('Service: Snackbar', function () {

  // load the service's module
  beforeEach(module('anchrClientApp'));

  // instantiate service
  var Snackbar;
  beforeEach(inject(function (_Snackbar_) {
    Snackbar = _Snackbar_;
  }));

  it('should do something', function () {
    expect(!!Snackbar).toBe(true);
  });

});
