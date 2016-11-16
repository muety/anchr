var loggers = require('./../log')();

/* Currently this only logs requests */
module.exports = function () {
  return function (req, res, next) {
    loggers.default.info('REQ: ' + req.ip + ' ' + req.method + ' ' + req.originalUrl + (req.user ? ' ' + req.user._id : ''));
    next();
  };
};
