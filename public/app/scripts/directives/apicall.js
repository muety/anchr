'use strict';

angular.module('anchrClientApp')
    .directive('apiCall', function () {
        return {
            templateUrl: 'views/templates/apicall.tpl.html',
            restrict: 'E',
            transclude: true,
            scope: {
                description: '@',
                url: '@',
                method: '@',
                section: '@'
            }
        };
    });
