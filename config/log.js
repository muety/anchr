var log4js = require('log4js')
  , config = require('./config');

module.exports = function () {
  /* Error logging */
  log4js.loadAppender('file');
  log4js.addAppender(log4js.appenders.file(config.errorLogPath), 'errorLogger');
  log4js.addAppender(log4js.appenders.file(config.accessLogPath), 'defaultLogger');
  var errorLogger = log4js.getLogger('errorLogger');
  var defaultLogger = log4js.getLogger('defaultLogger');

  process.on('uncaughtException', errLog);
  process.on('error', errLog);

  function errLog(err) {
    errorLogger.error(err.message.replace(/(\r\n|\n|\r)/gm, " "));
    errorLogger.error(err.stack.replace(/(\r\n|\n|\r)/gm, " "));
  }

  return { error : errorLogger, default : defaultLogger };
}
