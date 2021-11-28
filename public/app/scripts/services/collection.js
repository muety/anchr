'use strict';

angular.module('anchrClientApp')
  .factory('Collection', ['$resource', function ($resource) {
    return {
      collection: $resource('/api/collection/:_id', null, {
        'get' : {method : 'GET', params: {_id : '@_id'}},
        'query' : {method : 'GET', isArray : true},
        'delete' : {method : 'DELETE', params: {_id : '@_id'}},
        'update' : {method : 'PATCH', params: {_id : '@_id'}}
      }),
      links: $resource('/api/collection/:collId/links/:id', {collId : '@collId', id : '@_id'}),
      shortlinks: $resource('/api/collection/shortlinks/:id', {id : '@_id'}),
      shared: $resource('/api/shared/:_id', null)
    };
  }]);
