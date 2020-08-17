var express = require('express')
  , config = require('./config/config')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , log = require('./config/log')();

function connect(success, error) {
  function onConnectFailed() {
    setTimeout(function () {
      error()
    }, 0)
    throw new Error('unable to connect to database at ' + config.db);
  }

  log.default('Attempting to connect to database ...')
  mongoose.connect(config.db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 3000,
    serverSelectionTimeoutMS: 9000,
  }, function (err) {
    if (err) return onConnectFailed()
    else log.default('Successfully established database connection.')
  });

  var db = mongoose.connection;
  db.on('error', onConnectFailed);
  db.on('connected', success);
}

function run() {
  var models = fs.readdirSync(config.root + '/app/models').filter(function (f) {
    return f.endsWith('.js')
  });
  models.forEach(function (model) {
    require(config.root + '/app/models/' + model);
  });
  var app = express();

  require('./config/express')(app, config);

  app.listen(config.port, config.addr, function () {
    log.default('Express server listening on ' + config.addr + ':' + config.port);
  });
}

connect(run, function() {
  process.exit(1)
})