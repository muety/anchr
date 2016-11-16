'use strict';

angular.module('anchrClientApp.filters', [])
  .filter('imageForumLink', function () {
    return function (input) {
      return "[url=" + input + "][img=" + input + "][/url]";
    };
  })
  .filter('imageHtmlLink', function () {
    return function (input) {
      return "<a href='" + input + "'><img src='" + input + "'\></a>";
    };
  });
