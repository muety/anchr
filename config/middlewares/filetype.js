var _ = require('underscore'),
  fs = require('fs');

module.exports = function (allowedTypes) {
  function matchType(val) {
    for (var i = 0; i < allowedTypes.length; i++) {
      if (val.match(allowedTypes[i])) return true;
    }
    return false;
  };

  return function (req, res, next) {
    if (req.files && Object.keys(req.files).length) {
      _.each(req.files, function (val, key) {
        if (!matchType(val.type)) {
          var path = req.files[FILE_UPLOAD_FIELD].path;
          fs.unlink(path);
          res.status(415).send({ error: "Type not supported." });
        }
        else next();
      });
    }
    else next();
  };
};
