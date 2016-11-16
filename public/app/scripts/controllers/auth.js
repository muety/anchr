'use strict';

angular.module('anchrClientApp')
  .controller('AuthCtrl', ['Auth', 'Snackbar', 'token', function (Auth, Snackbar, token) {
    if (token) {
        Auth.saveToken(token);
        Snackbar.show("Successfully logged in.");
    }
      else Snackbar.show("Failed to log in :-(");
  }]);
