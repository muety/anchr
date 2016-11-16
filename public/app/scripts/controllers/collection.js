'use strict';

angular.module('anchrClientApp')
  .controller('CollectionCtrl', ['$scope', '$rootScope', 'Collection', 'Snackbar', '$window', '$timeout', function ($scope, $rootScope, Collection, Snackbar, $window, $timeout) {

    var collections = [];
    var nameAddedLatest = null;

    /* Either id or index! */
    $scope.setActiveCollection = function (id, index) {
      Collection.collection.get({_id : id}, function (result) {
        collections[findCollection(collections, id)] = result;
        $scope.data.active = id;
      }, function (err) {
        Snackbar.show("Failed to fetch collection " + getCollection(collections, id).name + " from server: " + err.data.error);
      });
    };

    $scope.getCollection = function (id) {
      for (var i = 0; i < collections.length; i++) {
        if (collections[i]._id == id) return collections[i];
      }
      return null;
    };

    $scope.saveLink = function (collId, link, desc) {
      var l = new Collection.links({
        collId : collId,
        url : link,
        description : desc
      });
      l.$save(function (result) {
        $scope.data.linkInput = '';
        $scope.data.descriptionInput = '';
        l.date = Date.now();
        $scope.getCollection(collId).links.push(l);
      }, function (err) {
        Snackbar.show('Failed to save link: ' + err.data.error);
      });
    };

    $scope.deleteLink = function (collId, linkId) {
      var l = new Collection.links({
        collId: collId,
        _id : linkId
      });
      l.$delete(function (result) {
        var c = $scope.getCollection(collId);
        c.links.splice(findLinkInCollection(c, linkId), 1);
      }, function (err) {
        Snackbar.show('Failed to delete link: ' + err.data.error);
      });
    };

    $scope.deleteCollection = function (collId) {
      var c = $scope.getCollection(collId);
      c.$delete(function (result) {
        collections.splice(findCollection(collections, collId), 1);
        $scope.setActiveCollection(collections[0]._id || 0);
      }, function (err) {
        Snackbar.show('Failed to delete collection: ' + err.data.error);
      });
    }

    $scope.addCollection = function (name) {
      new Collection.collection({
        name: name,
        link: []
      }).$save(function (result) {
          $scope.toggleNewCollection();
          $scope.clear();
        }, function (err) {
          Snackbar.show('Failed to create new collection: ' + err.data.error);
        });
    };

    $scope.shareCollection = function(collId) {
      new Collection.shared({
        _id : collId
      }).$save(function (result) {
          getCollection(collections, collId).shared = true;
          Snackbar.show('Collection shared.');
        }, function (err) {
          Snackbar.show('Failed to share collection: ' + err.data.error);
        });
    };

    $scope.clear = function () {
      $scope.data = {
        collections: collections,
        active : 0
      };

      Collection.collection.query(function (result) {
        collections = result;
        $scope.data.collections = collections;
        $scope.setActiveCollection(collections[0]._id);
      });
    };

    $scope.toggleNewCollection = function () {
      $scope.adding = !$scope.adding;
      $timeout(function () {
        if ($scope.adding) $window.onControllerEvent('newCollection');
      });
    };

    // RUN
    init();

    function init() {
      $scope.clear();
      $rootScope.init();
    }

    /* Return the index */
    function findLinkInCollection (coll, linkId) {
      for (var i = 0; i < coll.links.length; i++) {
        if (coll.links[i]._id == linkId) return i;
      }
      return -1;
    }

    /* Return the index */
    function findCollection (colls, collId) {
      for (var i = 0; i < colls.length; i++) {
        if (colls[i]._id == collId) return i;
      }
      return -1;
    }

    function findCollectionByName (colls, collName) {
      for (var i = 0; i < colls.length; i++) {
        if (colls[i].name == collName) return i;
      }
      return -1;
    }

    function getCollection (colls, collId) {
      return colls[findCollection(colls, collId)];
    }
  }]);
