'use strict';

angular.module('anchrClientApp')
  .controller('ViewCollectionCtrl', ['$scope', 'Collection', 'id', function ($scope, Collection, id) {

    $scope.data = {
      collection: {},
      currentPage: 1,
      numPages: 1
    };

    $scope.movePage = function (offset) {
      if ((!$scope.data.collection.links.length && offset > 0) || $scope.data.currentPage == 1 && offset < 0) return;
      $scope.data.currentPage = Math.max($scope.data.currentPage + offset, 1)
      query()
    };

    function query() {
      Collection.collection.get({ _id: id, page: $scope.data.currentPage, pageSize: 25 }, function (result, headers) {
        $scope.data.numPages = parseNumPages(headers('link'))
        if (result._id) $scope.data.collection = result;
        else queryShared();
      }, function (err) {
        queryShared();
      });
    }

    function queryShared() {
      Collection.shared.get({ _id: id, page: $scope.data.currentPage, pageSize: 25 }, function (result, headers) {
        $scope.data.numPages = parseNumPages(headers('link'))
        if (result._id) $scope.data.collection = result;
      });
    };

    function parseNumPages(linkHeader) {
      var match = /[\?&]page=(\d+)/gi.exec(linkHeader)
      if (match.length !== 2) return 1
      return parseInt(match[1]) || 1
    }

    query();
  }]);
