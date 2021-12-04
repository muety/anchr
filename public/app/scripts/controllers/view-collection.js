'use strict';

angular.module('anchrClientApp')
  .controller('ViewCollectionCtrl', ['$scope', '$timeout', 'Collection', 'id', function ($scope, $timeout, Collection, id) {
    var searchDebounce = null;

    $scope.data = {
      collection: {},
      currentPage: 1,
      numPages: 1,
      search: ''
    };

    $scope.onSearchUpdated = function () {
      if (searchDebounce != null) {
          $timeout.cancel(searchDebounce);
      }

      searchDebounce = $timeout(function () {
          query();
      }, 500);
  }

    $scope.movePage = function (offset) {
      if ($scope.data.currentPage === 1 && offset < 0) return;
      if ($scope.data.currentPage === $scope.data.numPages && offset > 0) return;
      $scope.data.currentPage = Math.max($scope.data.currentPage + offset, 1);
      query();
    };

    function query(shared) {
      (shared ? Collection.shared : Collection.collection).get({ _id: id }, function (result) {
        if (result._id) {
          $scope.data.collection = result;
          (shared ? Collection.sharedLinks : Collection.links).query({ collId: id, page: $scope.data.currentPage, pageSize: 25, q: $scope.data.search || undefined }, function (result, headers) {
            $scope.data.numPages = parseNumPages(headers('link'))
            $scope.data.collection.links = result;
          });
        }
        else if (!shared) query(true);
      }, function (err) {
        if (!shared) query(true);
      });
    }

    function parseNumPages(linkHeader) {
      var match = /[\?&]page=(\d+)/gi.exec(linkHeader)
      if (match.length !== 2) return 1
      return parseInt(match[1]) || 1
    }

    query();
  }]);
