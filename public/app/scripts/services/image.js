'use strict';

angular.module('anchrClientApp')
  .factory('Image', ['$resource', function ($resource) {
    return {
      json : $resource('/api/image/:id?json=true'),
      data : $resource('/api/image/:id')
    };
  }]);
