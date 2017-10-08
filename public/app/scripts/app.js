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
    .config(['$routeProvider', function($routeProvider) {
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
                    id: function($route) {
                        return $route.current.params.id;
                    }
                }
            })
            .when('/shortlink', {
                templateUrl: 'views/shortlink.html',
                controller: 'ShortlinkCtrl',
                controllerAs: 'shortlink'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginCtrl',
                controllerAs: 'login'
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
                    id: function($route) {
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
                    token: function($route) {
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
    .config(['$httpProvider', 'jwtInterceptorProvider', function($httpProvider, jwtInterceptorProvider) {
        $httpProvider.defaults.withCredentials = true;

        jwtInterceptorProvider.tokenGetter = ['Auth', function(Auth) {
            return localStorage.getItem('token');
        }];

        $httpProvider.interceptors.push('jwtInterceptor');
    }])
    .run(['$rootScope', function($rootScope) {
        $rootScope.init = function() {
            $(function() {
                $.material.init();
                $('[data-toggle="tooltip"]').tooltip();
            });
        };
    }])
    .run(['$rootScope', 'Config', function($rootScope, Config) {
        $rootScope.config = Config;
    }])
    .run(['$rootScope', 'Snackbar', 'Auth', '$location', function($rootScope, Snackbar, Auth, $location) {
        $rootScope.snackbar = Snackbar;
        $rootScope.isActive = function(viewLocation) {
            return viewLocation === $location.path();
        };
        $rootScope.loggedIn = Auth.loggedin;
        $rootScope.logout = function() {
            Auth.logout();
            Snackbar.show('You were logged out.');
        };
        $rootScope.stringEmpty = function(string) {
            return (string === '');
        };
        $rootScope.removeChar = function(string, char) {
            if (!string || !char) return '';
            return string.replace(char, '');
        }
    }])
    .run(['Auth', function(Auth) {
        if (Auth.loggedin()) Auth.renew();
    }])
    .run(['$rootScope', function($rootScope) {
        /* SET ENVIRONMENT / RUN MODE HERE WHEN DEPLOYING !!! */
        $rootScope.env = 'dev';
        //$rootScope.env = 'production';
    }]);