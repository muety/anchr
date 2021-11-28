'use strict';

angular
    .module('anchrClientApp', [
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngclipboard',
        'ngFileUpload',
        'anchrClientApp.filters',
        'angular-jwt'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                controllerAs: 'main'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl',
                controllerAs: 'about'
            })
            .when('/image', {
                templateUrl: 'views/image.html',
                controller: 'ImageCtrl',
                controllerAs: 'image'
            })
            .when('/image/:id', {
                templateUrl: 'views/view-image.html',
                controller: 'ViewImageCtrl',
                controllerAs: 'viewImage',
                resolve: {
                    id: function ($route) {
                        return $route.current.params.id;
                    }
                }
            })
            .when('/shortlink', {
                templateUrl: 'views/shortlink.html',
                controller: 'ShortlinkCtrl',
                controllerAs: 'shortlink'
            })
            .when('/collection', {
                templateUrl: 'views/collection.html',
                controller: 'CollectionCtrl',
                controllerAs: 'collection'
            })
            .when('/collection/:id', {
                templateUrl: 'views/view-collection.html',
                controller: 'ViewCollectionCtrl',
                controllerAs: 'viewCollection',
                resolve: {
                    id: function ($route) {
                        return $route.current.params.id;
                    }
                }
            })
            .when('/api', {
                templateUrl: 'views/api.html',
                controller: 'ApiCtrl',
                controllerAs: 'api'
            })
            .when('/auth/:token', {
                templateUrl: 'views/main.html',
                controller: 'AuthCtrl',
                controllerAs: 'auth',
                resolve: {
                    token: function ($route) {
                        return $route.current.params.token;
                    }
                }
            })
            .when('/terms', {
                templateUrl: 'views/terms.html',
                controller: 'TermsCtrl',
                controllerAs: 'terms'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .config(['$httpProvider', 'jwtInterceptorProvider', function ($httpProvider, jwtInterceptorProvider) {
        $httpProvider.defaults.withCredentials = true;

        jwtInterceptorProvider.tokenGetter = ['Auth', function (Auth) {
            return localStorage.getItem('token');
        }];

        $httpProvider.interceptors.push('jwtInterceptor');
    }])
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.hashPrefix('');
    }])
    .run(['$rootScope', function ($rootScope) {
        $rootScope.init = function () {
            $(function () {
                $.material.init();
                $('[data-toggle="tooltip"]').tooltip();
            });
        };
    }])
    .run(['$rootScope', 'Snackbar', 'Auth', '$location', '$window', function ($rootScope, Snackbar, Auth, $location, $window) {
        $rootScope.snackbar = Snackbar;
        $rootScope.isActive = function (viewLocation) {
            return viewLocation === $location.path();
        };
        $rootScope.loggedIn = Auth.loggedin;
        $rootScope.logout = function () {
            Auth.logout();
            Snackbar.show('You were logged out.');
            $window.onControllerEvent('logout');
        };
        $rootScope.stringEmpty = function (string) {
            return (string === '');
        };
        $rootScope.removeChar = function (string, char) {
            if (!string || !char) return '';
            return string.replace(char, '');
        }
        $rootScope.range = function(min, max, step) {
            step = step || 1;
            var input = [];
            for (var i = min; i <= max; i += step) {
                input.push(i);
            }
            return input;
        };
    }])
    .run(['Auth', function (Auth) {
        if (Auth.loggedin()) Auth.renew();
    }])
    .run(['$rootScope', '$location', function ($rootScope, $location) {
        $rootScope.getBaseUrl = function () {
            return $location.protocol() + '://' + location.host + '/';
        };

        $rootScope.getClientUrl = function () {
            return $rootScope.getBaseUrl() + '#/';
        };

        $rootScope.getApiUrl = function () {
            return $rootScope.getBaseUrl() + 'api/';
        };
    }]);