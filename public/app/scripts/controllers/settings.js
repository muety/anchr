'use strict';

angular.module('anchrClientApp')
  .controller('SettingsCtrl', ['$scope', '$rootScope', '$window', 'Auth', 'Snackbar', function ($scope, $rootScope, $window, Auth, Snackbar) {
    $scope.updatePassword = function () {
      Auth.updatePassword(
        $scope.data.oldPassword,
        $scope.data.newPassword,
        function () {
          Snackbar.show("Successfully updated password!");
          $('#modalSettings').modal('toggle');
        },
        function () {
          Snackbar.show("Failed to update password");
          $('#modalSettings').modal('toggle');
        } 
      )
    };

    $scope.clear = function () {
      $scope.data = {};
    };

    // RUN
    init();

    function init() {
      $scope.clear();

      $scope.data.authStrategy = Auth.tokenData().strategy;
    }
  }]);
