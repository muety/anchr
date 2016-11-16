var path = require('path')
  , env = process.env.NODE_ENV || 'development'
  , _ = require('underscore')
  , config = require('./config');

var config = {
  root : {
    'facebookAuth': {
      'clientID': '',
      'clientSecret': '',
      'callbackURL': config.publicUrl + '/auth/facebook/callback'
    },
    'googleAuth': {
      'clientID': '',
      'clientSecret': '',
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

module.exports = resolvedConfig;
