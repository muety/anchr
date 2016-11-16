var cluster = require('cluster')
  , config = require('./config/config')
  , loggers = require('./config/log')();

if (cluster.isMaster) {
  //var numWorkers = require('os').cpus().length;
  var numWorkers = config.workers;

  for (var i = 0; i < numWorkers; i += 1) {
    cluster.fork();
    cluster.on('exit', function (worker) {
      loggers.default.warn('Worker %d died :(', worker.id);
      cluster.fork();
    });
  }
} else {
  require('./app');
}
