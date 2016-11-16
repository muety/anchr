'use strict';

angular.module('anchrClientApp')
  .factory('Snackbar', function () {
    return {
      show : function (text) {
        $.snackbar({content : text, timeout : 3000, htmlAllowed : true});
      }
    }
  });
