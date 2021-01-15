'use strict';

angular.module('anchrClientApp')
    .controller('CollectionCtrl', ['$scope', '$rootScope', 'Collection', 'Remote', 'Snackbar', '$window', '$timeout', function ($scope, $rootScope, Collection, Remote, Snackbar, $window, $timeout) {

        var collections = [];
        var fetchTitleDebounce = null;

        /* Either id or index! */
        $scope.setActiveCollection = function (id, cached) {
            if ($scope.data.active === id && cached) return;

            function setActive() {
                $scope.data.search = ''
                $scope.data.active = id;
                $window.localStorage.setItem('selectedCollectionId', id);
            }

            if (!cached) {
                Collection.collection.get({ _id: id }, function (result) {
                    collections[findCollection(collections, id)] = result;
                    setActive();
                }, function (err) {
                    Snackbar.show("Failed to fetch collection " + getCollection(collections, id).name + " from server: " + err.data.error);
                });
            } else {
                setActive();
            }
        };

        $scope.getCollection = function (id) {
            for (var i = 0; i < collections.length; i++) {
                if (collections[i]._id == id) return collections[i];
            }
            return null;
        };

        $scope.saveLink = function (collId, link, desc) {
            var l = new Collection.links({
                collId: collId,
                url: link,
                description: desc
            });
            l.$save(function (result) {
                $scope.data.linkInput = '';
                $scope.data.descriptionInput = '';
                $scope.getCollection(collId).links.push({
                    _id: result._id,
                    url: result.url,
                    description: result.description,
                    date: result.date
                });
            }, function (err) {
                Snackbar.show('Failed to save link: ' + err.data.error);
            });
        };

        $scope.deleteLink = function (collId, linkId) {
            var l = new Collection.links({
                collId: collId,
                _id: linkId
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
                links: []
            }).$save(function (result) {
                collections.push(result);
                $scope.toggleNewCollection();
                $scope.setActiveCollection(result._id, true);
            }, function (err) {
                Snackbar.show('Failed to create new collection: ' + err.data.error);
            });
        };

        $scope.shareCollection = function (collId) {
            Collection.collection.update({ _id: collId, shared: true }, function (result) {
                getCollection(collections, collId).shared = true;
                Snackbar.show('Collection shared.');
            }, function (err) {
                Snackbar.show('Failed to share collection: ' + err.data.error);
            })
        };

        $scope.renameCollection = function (collId) {
            Collection.collection.update({ _id: collId, name: $scope.data.editing.newName }, function (result) {
                getCollection(collections, collId).name = $scope.data.editing.newName;
                $scope.data.editing = null;
                Snackbar.show('Collection updated.');
                $('#modalRename').modal('toggle');
            }, function (err) {
                Snackbar.show('Failed to update collection: ' + err.data.error);
            })
        };

        $scope.onLinkChanged = function () {
            if (!$scope.data.linkInput ||
                $scope.data.linkInput.length <= 0 ||
                ($scope.data.descriptionInput && $scope.data.descriptionInput.length)) {
                return;
            }

            if (fetchTitleDebounce != null) {
                $timeout.cancel(fetchTitleDebounce);
            }

            fetchTitleDebounce = $timeout(function () {
                $scope.data.loading = true;
                Remote.page.get({ url: $scope.data.linkInput }, function (result) {
                    $scope.data.loading = false;
                    if (!result.title) return;
                    $scope.data.descriptionInput = result.title;
                }, function (err) {
                    $scope.data.loading = false;
                });
            }, 500);
        };

        $scope.clear = function () {
            $scope.data = {
                collections: collections,
                active: 0,
                search: '',
                loading: false
            };

            Collection.collection.query(function (result) {
                collections = result;
                $scope.data.collections = collections;

                var selectedCollectionId = $window.localStorage.getItem('selectedCollectionId');
                if (selectedCollectionId === null) selectedCollectionId = collections[0]._id;
                $scope.setActiveCollection(selectedCollectionId);
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
        function findLinkInCollection(coll, linkId) {
            for (var i = 0; i < coll.links.length; i++) {
                if (coll.links[i]._id == linkId) return i;
            }
            return -1;
        }

        /* Return the index */
        function findCollection(colls, collId) {
            for (var i = 0; i < colls.length; i++) {
                if (colls[i]._id == collId) return i;
            }
            return -1;
        }

        function getCollection(colls, collId) {
            return colls[findCollection(colls, collId)];
        }
    }]);