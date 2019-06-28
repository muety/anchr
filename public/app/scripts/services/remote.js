'use strict';

angular.module('anchrClientApp')
  .factory('Remote', ['$resource', function ($resource) {
    return {
      page: $resource('/api/remote/page', null)
    };
  }]);
