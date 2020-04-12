var log = require('./../log')();

module.exports = function () {
  return function (req, res, next) {
    res.makeError = function (code, message, fullError) {
      if (fullError) log.default('req: %s %s %s %s %s %s %s', req.ip, req.method, req.originalUrl, (req.user ? ' ' + req.user._id : ''), code, fullError.message, fullError.stack);
      else log.default('res: ', req.ip, req.method, req.originalUrl, (req.user ? ' ' + req.user._id : ''), code, message);

      res.set('Connection', 'close');

      this.status(code).send({ error:message, status:code });
    };
    next();
  };
};
