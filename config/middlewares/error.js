var logger = require('./../log')();

module.exports = function () {
  return function (req, res, next) {
    res.makeError = function (code, message, err) {
      if (code >= 500) logger.error({ message: 'Error: ' + (err ? err : message) });
      this.set('Connection', 'close');
      this.status(code).send({ error: message, status: code });
    };
    next();
  };
};
