'use strict';

angular.module('anchrClientApp')
    .factory('Auth', ['$http', 'jwtHelper', function($http, jwtHelper) {
        return {
            signup: function(email, password, onSuccess, onError) {
                $http({
                    method: 'POST',
                    url: '/api/auth/signup',
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: { email: email, password: password }
                }).then(onSuccess, onError);
            },

            login: function(email, password, onSuccess, onError) {
                $http({
                    method: 'POST',
                    url: '/api/auth/token',
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: { email: email, password: password }
                }).then(onSuccess, onError);
            },

            renew: function() {
                $http({
                    method: 'POST',
                    url: '/api/auth/renew',
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: {}
                }).then(function(result) {
                    if (result.data && result.data.token) localStorage.token = result.data.token;
                }, function() {});
            },

            updatePassword: function(oldPassword, newPassword, onSuccess, onError) {
                $http({
                    method: 'PUT',
                    url: '/api/auth/password',
                    headers: {
                        'Accept': 'application/json'
                    },
                    data: {
                        old: oldPassword,
                        new: newPassword
                    }
                }).then(function(result) {
                    if (result.data && result.data.token) localStorage.token = result.data.token;
                    onSuccess(result);
                }, onError)
            },

            logout: function() {
                localStorage.clear();
            },

            loggedin: function() {
                var token = localStorage.getItem('token');
                return (token && !jwtHelper.isTokenExpired(token));
            },

            saveToken: function(token) {
                localStorage.token = token;
            },

            tokenData: function() {
                var token = localStorage.getItem('token');
                if (!token) return null;
                return jwtHelper.decodeToken(token);
            },

            deleteAccount: function(onSuccess, onError) {
                $http({
                    method: 'DELETE',
                    url: '/api/auth/me'
                }).then(onSuccess, onError);
            }
        }
    }]);