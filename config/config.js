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
        addr: process.env.LISTEN_ADDR || 'localhost',
        db: mongoConnectionString(),
        uploadDir: path.normalize((process.env.ANCHR_UPLOAD_DIR || '/var/data/anchr') + '/'),
        maxFileSize: 1000000 * 10,
        maxHtmlSizeKb: 1024,
        allowedFileTypes: ['image/'],
        secret: process.env.ANCHR_SECRET || 'shhh',
        tokenExpire: '7d',
        workers: 2,
        googleApiKey: process.env.ANCHR_GOOGLE_API_KEY || '',
        allowSignUp: process.env.ANCHR_ALLOW_SIGNUP !== 'false',
        basicAuth: process.env.ANCHR_BASIC_AUTH !== 'false',
        exposeMetrics: process.env.ANCHR_EXPOSE_METRICS === 'true',
        verifyUsers: process.env.ANCHR_VERIFY_USERS === 'true' || false,
        mailSender: process.env.ANCHR_MAIL_SENDER || 'Anchr.io <noreply@anchr.io>',
        smtp: {
            host: process.env.ANCHR_SMTP_HOST || '',
            port: process.env.ANCHR_SMTP_PORT || 587,
            secure: process.env.ANCHR_SMTP_TLS === 'true' || false, // not to be confused with STARTTLS
            auth: {
                user: process.env.ANCHR_SMTP_USER || '',
                pass: process.env.ANCHR_SMTP_PASS || '',
            }
        },
        mailwhale: {
            url: process.env.ANCHR_MAILWHALE_URL || 'https://mailwhale.dev',
            clientId: process.env.ANCHR_MAILWHALE_CLIENT_ID || '',
            clientSecret: process.env.ANCHR_MAILWHALE_CLIENT_SECRET,
        }
    },
    development: {
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

function mongoConnectionString() {
    if (process.env.ANCHR_DB_URL) return process.env.ANCHR_DB_URL
    return `mongodb://${process.env.ANCHR_DB_USER}:${process.env.ANCHR_DB_PASSWORD}@${process.env.ANCHR_DB_HOST}:${process.env.ANCHR_DB_PORT}/${process.env.ANCHR_DB_NAME}`
}

module.exports = resolvedConfig;