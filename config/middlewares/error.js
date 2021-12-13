var logger = require('./../log')();

module.exports = function () {
  return function (req, res, next) {
    res.makeError = function (code, message, err) {
      logger.error('Error: ' + err ? err : message);
      this.set('Connection', 'close');
      this.status(code).send({ error: message, status: code });
    };
    next();
  };
};
