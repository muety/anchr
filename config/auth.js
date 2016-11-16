var path = require('path')
  , env = process.env.NODE_ENV || 'development'
  , _ = require('underscore')
  , config = require('./config');

var config = {
  root : {
    'facebookAuth': {
      'clientID': '1500121216949646',
      'clientSecret': 'a0861e90003c9c2673efde7a2f0d7c3a',
      'callbackURL': config.publicUrl + '/auth/facebook/callback'
    },
    'googleAuth': {
      'clientID': '256452863625-pcr44flu7b4lcrfrknb0qr8sqi1ampoc.apps.googleusercontent.com',
      'clientSecret': 'wFR0iG_53rUvu_20XYEdgk3Y',
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
