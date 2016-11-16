'use strict';

angular.module('anchrClientApp')
  .controller('LoginCtrl', ['$scope', '$window', 'Auth', 'Snackbar', function ($scope,$window, Auth, Snackbar) {


    $scope.login = function() {
      var e = $scope.data.email;
      var p = $scope.data.password;
      var onSuccess = function (result) {
        localStorage.token = result.data.token;
        $scope.data.loading = false;
        $window.onControllerEvent('login');
        Snackbar.show("Login successful.");
      };
      var onError = function (result) {
        Snackbar.show("Sorry, there was an error while logging in" + result.data.error ? ' :' + result.data.error : '.');
        $scope.data.loading = false;
      }

      if (e && p) {
        $scope.data.loading = true;
        Auth.login(e, p, onSuccess, onError);
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
