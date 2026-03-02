'use strict';

angular.module('anchrClientApp')
  .controller('ImageCtrl', ['$rootScope', '$scope', 'Snackbar', 'Upload', 'Encryption', '$timeout', function ($rootScope, $scope, Snackbar, Upload, Encryption, $timeout) {
    var allowedTypes = ['image/'];

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

      var processPromise = Promise.resolve(file);
      if ($scope.files.webp && file.type !== 'image/webp') {
        processPromise = convertToWebP(file).catch(function(err) {
          console.error("WebP conversion failed:", err);
          return file;
        });
      }

      processPromise.then(function(processedFile) {
        file = processedFile;
        reader.onload = function (e) {
          Encryption.encrypt(e.target.result, password)
            .then(function (encrypted) {
              var blob = new Blob([encrypted], { type: file.type });
              blob.name = file.name;
              blob.encrypted = true;
              $scope.files.loading = false;
              $scope.uploadFiles([blob], []);
            })
            .catch(function(error) {
              console.error(error);

              $scope.files.loading = false;
              Snackbar.show("Failed to encrypt image.");
            });
        };

        reader.readAsArrayBuffer(file);
      });
    };

    $scope.uploadFiles = function (files, errFiles) {
      if ((files && files.length) || (errFiles && errFiles.length)) {
        $scope.files.files = $scope.files.files.concat(files);
        $scope.files.errFiles = $scope.files.errFiles.concat(errFiles);

        angular.forEach(files, function (file) {
          if (!arrayMatch(allowedTypes, file.type)) {
            file.err = "Type not allowed.";
            file.finished = true;
          }
          else {
            var processPromise = Promise.resolve(file);
            if ($scope.files.webp && !file.encrypted && file.type !== 'image/webp') {
              processPromise = convertToWebP(file).catch(function(err) {
                console.error("WebP conversion failed:", err);
                return file;
              });
            }

            processPromise.then(function(processedFile) {
              file.upload = Upload.upload({
                url: $rootScope.getApiUrl() + 'image',
                data: { uploadFile: processedFile, encrypted: processedFile.encrypted }
              });

              file.upload.then(function (response) {
                $timeout(function () {
                  file.result = response.data;
                  file.finished = true;
                  $rootScope.init();
                });
              }, function (response) {
                file.err = response.data && response.data.error ? response.data.error : 'Unknown error encountered during upload. Maybe unauthorized?';
                file.finished = true;
              }, function (evt) {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
              });
            });
          }
        });
      }
    };

    $scope.clear = function () {
      $scope.files = {
        files: [],
        errFiles: [],
        password: null,
        encrypt: false,
        webp: true,
        loading: false
      };
    };

    // RUN
    init();

    function init() {
      $scope.clear();
      $rootScope.init();
    }

    function arrayMatch(regexArray, val) {
      for (var i = 0; i < regexArray.length; i++) {
        if (val.match(regexArray[i])) return true;
      }
      return false;
    }

    function convertToWebP(file) {
      return new Promise(function(resolve, reject) {
        if (!window.OffscreenCanvas) {
          reject("OffscreenCanvas not supported");
          return;
        }

        createImageBitmap(file).then(function(bitmap) {
          var canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
          var ctx = canvas.getContext('2d');
          ctx.drawImage(bitmap, 0, 0);
          canvas.convertToBlob({ type: 'image/webp' }).then(function(blob) {
            var name = file.name;
            var lastDot = name.lastIndexOf('.');
            if (lastDot !== -1) {
              name = name.substring(0, lastDot);
            }
            blob.name = name + ".webp";
            resolve(blob);
          });
        }).catch(reject);
      });
    }
  }]);
