module.exports = function () {
  var errorLogger = err => console.error(err.message)
  var defaultLogger = console.log;

  process.on('uncaughtException', errLog);
  process.on('error', errLog);

  function errLog(err) {
    errorLogger(err.message.replace(/(\r\n|\n|\r)/gm, " "));
    errorLogger(err.stack.replace(/(\r\n|\n|\r)/gm, " "));
  }

  return { error : errorLogger, default : defaultLogger };
}
