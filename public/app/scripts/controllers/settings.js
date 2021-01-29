'use strict';

angular.module('anchrClientApp')
  .controller('SettingsCtrl', ['$scope', '$rootScope', 'Auth', 'Snackbar', function ($scope, $rootScope, Auth, Snackbar) {
    $scope.updatePassword = function () {
      Auth.updatePassword(
        $scope.data.oldPassword,
        $scope.data.newPassword,
        function () {
          Snackbar.show("Successfully updated password!");
          $('#modalSettings').modal('toggle');
          $scope.clear();
        },
        function () {
          Snackbar.show("Failed to update password");
          $('#modalSettings').modal('toggle');
          $scope.clear();
        }
      )
    };

    $scope.deleteAccount = function () {
      Auth.deleteAccount(
        function () {
          $rootScope.logout();
          $scope.clear();
        },
        function (err) {
          Snackbar.show('Failed to delete account, something went wrong.');
          $scope.clear();
        }
      );
    }

    $scope.clear = function () {
      $scope.data = {
        deleting: false
      };
    };

    // RUN
    init();

    function init() {
      $scope.clear();

      var tokenData = Auth.tokenData();
      $scope.data.authStrategy = tokenData ? tokenData.strategy : '';
    }
  }]);
