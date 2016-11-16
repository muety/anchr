'use strict';

angular.module('anchrClientApp')
  .factory('Shortlink', ['$resource', function ($resource) {
    return $resource('/api/shortlink/:id');
  }]);
