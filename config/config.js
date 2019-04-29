var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development',
    _ = require('underscore');

/* Specialized configs (development, test, production) will inherit and possibly override all properties from root */
var config = {
    root: {
        publicUrl: 'http://localhost:3000/api',
        publicShortlinkUrl: 'http://localhost:3000/s',
        publicImageUrl: 'http://localhost:3000/i',
        clientUrl: 'http://localhost:3000/#/',
        root: rootPath,
        app: {
            name: 'anchr-multi-webservice'
        },
        port: parseInt(process.env.PORT) || 3000,
        db: process.env.ANCHR_DB_URL || '   ',
        uploadDir: path.normalize((process.env.ANCHR_UPLOAD_DIR || '/var/data/anchr') + '/'),
        maxFileSize: 1000000 * 10,
        allowedFileTypes: ['image/'],
        secret: process.env.ANCHR_SECRET || 'shhh',
        tokenExpire: '7d',
        workers: 2,
        accessLogPath: path.normalize(process.env.ANCHR_LOG_PATH || '/var/log/anchr/access.log'),
        errorLogPath: path.normalize(process.env.ANCHR_ERROR_LOG_PATH || '/var/log/anchr/error.log'),
        googleApiKey: process.env.ANCHR_GOOGLE_API_KEY || '',
        allowSignUp: process.env.ANCHR_ALLOW_SIGNUP !== 'false'
    },
    development: {
        accessLogPath: path.normalize('./access.log'),
        errorLogPath: path.normalize('./error.log')
    },
    test: {},
    production: {
        publicUrl: 'https://anchr.io/api',
        publicShortlinkUrl: 'https://anchr.io/s',
        publicImageUrl: 'https://anchr.io/i',
        clientUrl: 'https://anchr.io/#/'
    }
};

var resolvedConfig = {};
_.extend(resolvedConfig, config.root, config[env]);

module.exports = resolvedConfig;