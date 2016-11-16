'use strict';

angular.module('anchrClientApp')
  .factory('Collection', ['$resource', function ($resource) {
    return {
      collection: $resource('/api/collection/:_id', null, {
        'query' : {method : 'GET', isArray : true, params: {'short' : true}},
        'delete' : {method : 'DELETE', params: {_id : '@_id'}}
      }),
      links: $resource('/api/collection/:collId/links/:id', {collId : '@collId', id : '@_id'}),
      shortlinks: $resource('/api/collection/shortlinks/:id', {id : '@_id'}),
      shared: $resource('/api/shared/:_id', null, {
        'save' : {method : 'POST', params: {_id : '@_id'}}
      })
    };
  }]);
