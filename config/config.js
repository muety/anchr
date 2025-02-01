const path = require('path'),
    rootPath = path.normalize(`${__dirname}/..`),
    env = process.env.NODE_ENV || 'development',
    _ = require('underscore')

/* Specialized configs (development, test, production) will inherit and possibly override all properties from root */
const config = {
    root: {
        publicUrl: `${process.env.ANCHR_PUBLIC_URL || 'http://localhost:3000'}/api`,
        publicShortlinkUrl: `${process.env.ANCHR_PUBLIC_URL || 'http://localhost:3000'}/s`,
        publicImageUrl: `${process.env.ANCHR_PUBLIC_URL || 'http://localhost:3000'}/i`,
        clientUrl: `${process.env.ANCHR_PUBLIC_URL || 'http://localhost:3000'}/#/`,
        root: rootPath,
        app: {
            name: 'anchr-multi-webservice'
        },
        port: parseInt(process.env.PORT) || 3000,
        addr: process.env.LISTEN_ADDR || 'localhost',
        db: mongoConnectionString(),
        uploadDir: path.normalize(`${process.env.ANCHR_UPLOAD_DIR || '/var/data/anchr'}/`),
        maxFileSize: 1000000 * 10,
        maxHtmlSizeKb: 1024,
        imageProxyUrlTpl: process.env.ANCHR_IMAGE_PROXY_URL_TPL,
        allowedFileTypes: ['image/'],
        shortlinkCollectionName: process.env.ANCHR_SHORTLINK_COLLECTION || 'My shortlinks',
        cron: {
            linkcheckUpdate: process.env.ANCHR_LINKCHECK_UPDATE_CRON || '10 0 * * *',
            shortlinkCleanup: process.env.ANCHR_LINKCHECK_UPDATE_CRON || '20 0 * * *',
        },
        secret: process.env.ANCHR_SECRET || 'shhh',
        tokenExpire: '7d',
        workers: 2,
        googleApiKey: process.env.ANCHR_GOOGLE_API_KEY || '',
        allowSignUp: process.env.ANCHR_ALLOW_SIGNUP !== 'false',
        basicAuth: process.env.ANCHR_BASIC_AUTH !== 'false',
        exposeMetrics: process.env.ANCHR_EXPOSE_METRICS === 'true',
        verifyUsers: process.env.ANCHR_VERIFY_USERS === 'true' || false,
        mailSender: process.env.ANCHR_MAIL_SENDER || 'Anchr.io <noreply@anchr.io>',
        telegram: {
            botToken: process.env.ANCHR_TELEGRAM_BOT_TOKEN || '',
            urlSecret: process.env.ANCHR_TELEGRAM_URL_SECRET || '',
        },
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
        },
    },
    development: {
    },
    test: {},
    production: {
        publicUrl: `${process.env.ANCHR_PUBLIC_URL || 'https://anchr.io'}/api`,
        publicShortlinkUrl: `${process.env.ANCHR_PUBLIC_URL || 'https://anchr.io'}/s`,
        publicImageUrl: `${process.env.ANCHR_PUBLIC_URL || 'https://anchr.io'}/i`,
        clientUrl: `${process.env.ANCHR_PUBLIC_URL || 'https://anchr.io'}/#/`,
    }
}

const resolvedConfig = {}
_.extend(resolvedConfig, config.root, config[env])

function mongoConnectionString() {
    if (process.env.ANCHR_DB_URL) return process.env.ANCHR_DB_URL
    return `mongodb://${process.env.ANCHR_DB_USER}:${process.env.ANCHR_DB_PASSWORD}@${process.env.ANCHR_DB_HOST}:${process.env.ANCHR_DB_PORT}/${process.env.ANCHR_DB_NAME}`
}

module.exports = resolvedConfig