'use strict';

angular.module('anchrClientApp')
  .controller('ViewImageCtrl', ['$scope', '$rootScope', '$http', '$location', 'Snackbar', 'Image', 'Encryption', 'id', function ($scope, $rootScope, $http, $location, Snackbar, Image, Encryption, id) {
    $rootScope.init();

    $scope.image = {};
    $scope.data = {
      password: '',
      imgSrc: null,
      loading: false
    };

    Image.get.get({ id: id }, function (result) {
      $scope.image = result;
      $scope.image.created = Date.parse($scope.image.created);
      $scope.image.link = $location.absUrl();
    });

    $scope.decrypt = function () {
      $scope.data.loading = true;

      var relativeHref = new URL($scope.image.href).pathname
      $http.get(relativeHref, { responseType: 'arraybuffer' })
        .then(function (result) {
          var password = $scope.data.password;

          Encryption.decrypt(result.data, password)
            .then(function (decrypted) {
              var reader = new FileReader();
              var blob = new Blob([decrypted], { type: $scope.image.type });

              reader.onload = function (event) {
                var result = event.target.result;

                $scope.data.imageSrc = result;
                $scope.data.loading = false;
                $scope.$apply();
              }

              reader.readAsDataURL(blob)
            })
            .catch(function (error) {
              console.error(error);

              $scope.data.loading = false;
              $scope.data.password = '';
              $scope.$apply();
              Snackbar.show("Invalid password.");
            })
        }, function (err) {
          console.log(err)
        });
    };
  }]);
