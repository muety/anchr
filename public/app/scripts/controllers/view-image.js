'use strict';

angular.module('anchrClientApp')
  .controller('ViewImageCtrl', ['$scope', '$rootScope', '$http', '$location', 'Snackbar', 'Image', 'id', function ($scope, $rootScope, $http, $location, Snackbar, Image, id) {
    $rootScope.init();

    $scope.image = {};
    $scope.data = {
      password : '',
      imgSrc : null,
      loading: false
    };

    Image.json.get({id : id}, function(result) {
      $scope.image = result;
      $scope.image.created = Date.parse($scope.image.created);
      $scope.image.link = $location.absUrl();
    });

    $scope.decrypt = function () {
      var relativeHref = new URL($scope.image.href).pathname
      $scope.data.loading = true;
      $http.get(relativeHref).then(function (result) {
        var password = $scope.data.password;
        var reader = new FileReader();
        var blob = new Blob([result.data], { type: $scope.image.type });

        reader.onload = function(e){

          var decrypted = CryptoJS.AES.decrypt(e.target.result, password).toString(CryptoJS.enc.Latin1);

          if(!/^data:/.test(decrypted)){
            $scope.data.loading = false;
            $scope.data.password = '';
            $scope.$apply();
            Snackbar.show("Invalid password.");
            return false;
          }

          $scope.data.imageSrc = decrypted;
          $scope.data.loading = false;
          $scope.$apply();
        };

        reader.readAsText(blob);

      }, function (err) {
        console.log(err)
      });
    };
  }]);
