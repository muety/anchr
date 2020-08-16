var express = require('express')
  , config = require('./config/config')
  , fs = require('fs')
  , mongoose = require('mongoose')
  , log = require('./config/log')();

mongoose.connect(config.db, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = fs.readdirSync(config.root + '/app/models').filter(function(f) {
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

