'use strict';

angular.module('anchrClientApp')
  .controller('ShortlinkCtrl', ['$scope', '$rootScope', 'Shortlink', 'Collection', 'Snackbar', function ($scope, $rootScope, Shortlink, Collection, Snackbar) {

    $scope.createShortlink = function (url) {
      $scope.data.loading = true;
      var sl = new Shortlink({url : url});
      sl.$save(function (result) {
        if (!result || !result._id) return Snackbar.show("Error while shortening link :-(");
        $scope.data.shortlinks.push(result);
        $scope.data.loading = false;
        $scope.data.linkInput = '';

        if ($rootScope.loggedIn()) saveToCollection(result);
      });
    };

    $scope.clear = function () {
      $scope.data = {
        loading: false,
        linkInput: '',
        shortlinks : []
      };
    }

    // RUN
    init();

    function init() {
      $scope.clear();
      $rootScope.init();
    }

    function saveToCollection (link) {
      new Collection.shortlinks({
        url : link.href,
        description: 'Shortlink to ' + link.url
      }).$save(function (result){}, function (err) {
          Snackbar.show('Failed to save shortlink to your collection: ' + err.data.error);
        });
    };

  }]);
