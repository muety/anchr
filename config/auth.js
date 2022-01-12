var env = process.env.NODE_ENV || 'development'
  , _ = require('underscore')
  , config = require('./config');

var config = {
  root : {
    'facebookAuth': {
      'clientID': process.env.ANCHR_FB_CLIENT_ID || '',
      'clientSecret': process.env.ANCHR_FB_SECRET || '',
      'callbackURL': config.publicUrl + '/auth/facebook/callback'
    },
    'googleAuth': {
      'clientID': process.env.ANCHR_GOOGLE_CLIENT_ID || '',
      'clientSecret': process.env.ANCHR_GOOGLE_SECRET || '',
      'callbackURL': config.publicUrl + '/auth/google/callback'
  }
  },
  development: {
  },

  test: {
  },

  production: {
  }
};

var resolvedConfig = {};
_.extend(resolvedConfig, config.root, config[env]);

resolvedConfig.with = function(key) {
  return resolvedConfig.hasOwnProperty(key) && Object.values(resolvedConfig[key]).every(function (e) {
    return !!e
  });
}

module.exports = resolvedConfig;
