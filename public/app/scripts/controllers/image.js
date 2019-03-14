'use strict';

angular.module('anchrClientApp')
  .controller('ImageCtrl', ['$rootScope', '$scope', 'Upload', '$timeout', function ($rootScope, $scope, Upload, $timeout) {
    var allowedTypes = ['image/'];

    /* Depends on http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js to be included */
    $scope.encryptAndUpload = function (files, errFiles) {
      $scope.files.loading = true;
      var password = $scope.files.password;
      var file = files[0];
      var reader = new FileReader();

      if (!file || !arrayMatch(allowedTypes, file.type)) {
        $scope.uploadFiles(files, errFiles);
        $scope.files.loading = false;
        return false;
      }

      reader.onload = function(e){
        var encrypted = CryptoJS.AES.encrypt(e.target.result, password);
        var blob = new Blob([encrypted], {type: file.type});
        blob.name = file.name;
        blob.encrypted = true;
        $scope.files.loading = false;
        $scope.uploadFiles([blob], []);
      };

      reader.readAsDataURL(file);
    };

    $scope.uploadFiles = function(files, errFiles) {
      if ((files && files.length) || (errFiles && errFiles.length)) {
        $scope.files.files = $scope.files.files.concat(files);
        $scope.files.errFiles = $scope.files.errFiles.concat(errFiles);

        angular.forEach(files, function (file) {
          if (!arrayMatch(allowedTypes, file.type)) {
            file.err = "Type not allowed.";
            file.finished = true;
          }
          else {
            file.upload = Upload.upload({
              url: $rootScope.getApiUrl() + 'image',
              data: {uploadFile: file, encrypted: file.encrypted}
            });

            file.upload.then(function (response) {
              $timeout(function () {
                file.result = response.data;
                file.finished = true;
                $rootScope.init();
              });
            }, function (response) {
              if (response.status > 0) {
                file.err = response.data.error;
                file.finished = true;
              }
            }, function (evt) {
              file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });
          }
        });
      }
    };

    $scope.clear = function () {
      $scope.files = {
        files : [],
        errFiles: [],
        password: null,
        encrypt: false,
        loading: false
      };
    };

    // RUN
    init();

    function init() {
      $scope.clear();
      $rootScope.init();
    }

    function arrayMatch (regexArray, val) {
      for (var i=0; i<regexArray.length; i++) {
        if (val.match(regexArray[i])) return true;
      }
      return false;
    }
  }]);
