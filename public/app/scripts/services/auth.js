'use strict';

angular.module('anchrClientApp')
  .factory('Auth', ['$http', 'jwtHelper', function ($http, jwtHelper) {
    return {
      signup: function (email, password, onSuccess, onError) {
        $http({
          method : 'POST',
          url : '/api/auth/signup',
          headers : {
            'Accept' : 'application/json'
          },
          data : {email : email, password : password}
        }).then(onSuccess, onError);
      },

      login: function (email, password, onSuccess, onError) {
        $http({
          method : 'POST',
          url : '/api/auth/token',
          headers : {
            'Accept' : 'application/json'
          },
          data : {email : email, password : password}
        }).then(onSuccess, onError);
      },

      logout: function () {
        localStorage.removeItem('token');
      },

      loggedin : function () {
          var token = localStorage.getItem('token');
          return (token && !jwtHelper.isTokenExpired(token));
      },

      saveToken : function (token) {
        localStorage.token = token;
      }
    }
  }]);
