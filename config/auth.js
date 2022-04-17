const env = process.env.NODE_ENV || 'development'
    , _ = require('underscore')
    , cfg = require('./config')

const config = { 
    root : {
        'facebookAuth': {
            'clientID': process.env.ANCHR_FB_CLIENT_ID || '',
            'clientSecret': process.env.ANCHR_FB_SECRET || '',
            'callbackURL': `${cfg.publicUrl}/auth/facebook/callback`
        },
        'googleAuth': {
            'clientID': process.env.ANCHR_GOOGLE_CLIENT_ID || '',
            'clientSecret': process.env.ANCHR_GOOGLE_SECRET || '',
            'callbackURL': `${cfg.publicUrl}/auth/google/callback`
        }
    },
    development: {
    },

    test: {
    },

    production: {
    }
}

const resolvedConfig = {}
_.extend(resolvedConfig, config.root, config[env])

resolvedConfig.with = function(key) {
    return resolvedConfig.hasOwnProperty(key) && Object.values(resolvedConfig[key]).every((e) => {
        return !!e
    })
}

module.exports = resolvedConfig