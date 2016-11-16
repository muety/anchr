'use strict';

angular.module('anchrClientApp')
  .controller('ViewCollectionCtrl', ['$scope', '$rootScope', 'Collection', 'Snackbar', 'id', function ($scope, $rootScope, Collection, Snackbar, id) {

    $scope.data = {
      collection: {}
    };

    Collection.collection.get({_id : id}, function (result) {
      if (result._id) $scope.data.collection = result;
      else queryShared();
    }, function (err) {
      queryShared();
    });

    function queryShared() {
      Collection.shared.get({_id : id}, function (result) {
        if (result._id) $scope.data.collection = result;
      });
    };
  }]);
