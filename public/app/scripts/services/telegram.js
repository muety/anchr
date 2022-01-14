'use strict';

angular.module('anchrClientApp')
  .factory('Telegram', ['$resource', function ($resource) {
    return {
      otp: $resource('/api/telegram/otp', null, {
        get: {
          method: 'GET',
          headers: { 'Accept': 'text/plain' },
          responseType: 'text',
          transformResponse: function (data) {
            // for some reason, angular keeps converting the string to a json object
            // i.e. converts 123456 to { 1: "1", 2: "2", ... } 
            // this happens event when setting transformResponse to an empty array as suggested at https://docs.angularjs.org/api/ngResource/service/$resource#!
            return { otp: data }
          }
        }
      })
    };
  }]);
