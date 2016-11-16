var express = require('express')
  , path = require('path')
  , glob = require('glob')
  , config = require('./config')
  , favicon = require('serve-favicon')
  , bodyParser = require('body-parser')
  , compress = require('compression')
  , methodOverride = require('method-override')
  , multipart = require('connect-multiparty')
  , filetype = require('./middlewares/filetype')
  , error = require('./middlewares/error')
  , log = require('./middlewares/log')()
  , passport = require('passport')
  , monitoring = require('express-status-monitor');

module.exports = function(app, config) {
  var env = process.env.NODE_ENV || 'development';
  app.locals.ENV = env;
  app.locals.ENV_DEVELOPMENT = env == 'development';

  // Include express monitoring at /serverstats
  app.use(monitoring({
    title: 'Anchr.io Status Page',
    path: '/serverstats',
    spans: [{
      interval: 1,
      retention: 60
    }, {
      interval: 15,
      retention: 60
    }, {
      interval: 60,
      retention: 60
    }]
  }));

  app.set('etag', false);

  if (env === 'development') {
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

      // intercept OPTIONS method
      if ('OPTIONS' == req.method) {
        res.sendStatus(200);
      }
      else {
        next();
      }
    });
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(multipart({maxFilesSize : config.maxFilesSize}));
  app.use(filetype(config.allowedFileTypes));
  app.use(compress());
  app.use(error());

  app.set('views', path.normalize(__dirname + '/../app/views/'));
  app.set('view engine', 'jade');

  // Passport
  app.use(passport.initialize());
  require('./passport')(passport);

  if (env === 'development') {
    app.use('/', express.static(config.root + '/public/app', {redirect: false}));
    app.use('/bower_components', express.static(config.root + '/public/bower_components', {redirect: false}));
  }
  else {
    app.use('/', express.static(config.root + '/public/dist', {redirect: false}));
  }

  app.use(methodOverride());

  var controllers = glob.sync(config.root + '/app/controllers/*.js');
  controllers.forEach(function (controller) {
    require(controller)(app, passport);
  });

  app.use(function (req, res, next) {
    res.redirect('/');
  });

  app.use(function (err, req, res, next) {
    return res.makeError(err.status || 500, err.message, err);
  });

  app.enable('trust proxy');
};
