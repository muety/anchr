'use strict';

angular.module('anchrClientApp')
  .constant('Config', {
    dev: {
      clientBaseUrl: 'http://localhost:3000/#/',
      serverBaseUrl: 'http://localhost:3000/',
      apiBaseUrl: 'http://localhost:3000/api/'
    },
    production: {
      clientBaseUrl: 'https://anchr.io/#/',
      serverBaseUrl: 'https://anchr.io/',
      apiBaseUrl: 'https://anchr.io/api/'
    }
  });
