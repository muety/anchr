'use strict';

angular.module('anchrClientApp')
  .controller('SignupCtrl', ['$scope', '$rootScope', '$window', 'Auth', 'Snackbar', function ($scope, $rootScope, $window, Auth, Snackbar) {
    $scope.signup = function() {
      var e = $scope.data.email;
      var p = $scope.data.password;
      var onSuccess = function (result) {
        Snackbar.show("You have signed up successfully.");
        $scope.data.loading = false;
        $rootScope.isNewUser = true;
        $window.onControllerEvent('signup');
      };
      var onError = function (result) {
        Snackbar.show("Sorry, there was an error while signing up" + result.data.error ? ' :' + result.data.error : '.');
        $scope.data.loading = false;
      }

      if (e && p) {
        $scope.data.loading = true;
        Auth.signup(e, p, onSuccess, onError);
      }
    };

    $scope.clear = function() {
      $scope.data = {};
    };

    // RUN
    init();

    function init() {
      $scope.clear();
    }
  }]);
