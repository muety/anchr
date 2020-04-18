'use strict';

angular.module('anchrClientApp')
  .factory('Image', ['$resource', function ($resource) {
    return {
      get : $resource('/api/image/:id', {}, {
        get: {
          method: 'GET',
            headers: { 'Accept': 'application/json' }
        }
      }),
    };
  }]);
