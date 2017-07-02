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
        port: 3000,
        db: 'mongodb://anchr:Agiwovibu146@ferdinand-muetsch.de:27017/anchr',
        uploadDir: path.normalize('C:\\Users\\Ferdinand\\WebstormProjects\\anchr\\data\\'),
        maxFileSize: 1000000 * 10,
        allowedFileTypes: ['image/'],
        secret: 'shhh',
        tokenExpire: '30d',
        workers: 2,
        accessLogPath: path.normalize('C:\\Users\\Ferdinand\\WebstormProjects\\anchr\\log\\access.log\\'),
        errorLogPath: path.normalize('C:\\Users\\Ferdinand\\WebstormProjects\\anchr\\log\\error.log\\'),
        googleApiKey: 'AIzaSyCjjrpLaBBvF202Gr2xzqgmX4nJAHtFML8'
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
        clientUrl: 'https://anchr.io/#/',
        uploadDir: path.normalize('/var/data/anchr.io/'),
        secret: 'DRwZ34eG9CbDkAXauqGO7SOUYUWYt2kc',
        accessLogPath: path.normalize('/var/log/anchr/access.log'),
        errorLogPath: path.normalize('/var/log/anchr/error.log'),
        port: 3005
    }
};

var resolvedConfig = {};
_.extend(resolvedConfig, config.root, config[env]);

module.exports = resolvedConfig;