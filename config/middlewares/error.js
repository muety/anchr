var loggers = require('./../log')();

module.exports = function () {
  return function (req, res, next) {
    res.makeError = function (code, message, fullError, forceHtml) {
      if (fullError) loggers.default.error('RES: ' + req.ip + ' ' + req.method + ' ' + req.originalUrl + (req.user ? ' ' + req.user._id : '') + ' ' + code + ' ' + fullError.message + ' ' + fullError.stack);
      else loggers.default.error('RES: ' + req.ip + ' ' + req.method + ' ' + req.originalUrl + (req.user ? ' ' + req.user._id : '') + ' ' + code + ' ' + message);

      if (req.accepts('json') && !forceHtml) this.status(code).send({error:message, status:code});
      else this.status(code).render('error', {message:message, status:code});
    };
    next();
  };
};
