const express = require('express')
    , authConfig = require('./auth')
    , cors = require('cors')
    , fs = require('fs')
    , bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , error = require('./middlewares/error')
    , security = require('./middlewares/security')
    , passport = require('passport')
    , mongoose = require('mongoose')
    , swaggerSpec = require('./swagger').specs
    , swaggerUi = require('swagger-ui-express')
    , version = require('../package.json').version

module.exports = function (app, config) {
    const env = process.env.NODE_ENV || 'development'
    app.locals.ENV = env
    app.locals.ENV_DEVELOPMENT = env == 'development'

    if (env === 'development') {
        app.use((req, res, next) => {
            app.use(cors())

            // intercept OPTIONS method
            if ('OPTIONS' == req.method) {
                res.sendStatus(200)
            }
            else {
                next()
            }
        })
    }

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(error())
    app.use(security())

    // Passport
    app.use(passport.initialize())
    require('./passport')(passport)

    if (env === 'development') {
        app.use('/', express.static(`${config.root}/public/app`, { redirect: false }))
        app.use('/bower_components', express.static(`${config.root}/public/bower_components`, { redirect: false }))
    }
    else {
        app.use('/', express.static(`${config.root}/public/dist`, {
            redirect: false,
            setHeaders: (res, path) => {
                if (/.*\.(css|js|png|jpg)/.test(path)) res.setHeader('Cache-Control', 'public, max-age=604800')
            }
        }))
    }

    // Health endpoint
    app.get('/health', (req, res) => {
        let text = 'app=1\n'
        text += `db=${mongoose.connection.readyState}\n`
        text += `v=${version}`

        res.set('Content-Type', 'text/plain')
        res.send(text)
    })

    // Capabilites endpoint
    app.get('/api/capabilities', (req, res) => {
        const capabilities = []
        if (authConfig.with('facebookAuth')) capabilities.push('auth.facebook')
        if (authConfig.with('googleAuth')) capabilities.push('auth.google')
        if (config.allowSignUp) capabilities.push('signup')
        res.set('Content-Type', 'text/plain')
        res.send(capabilities.join(','))
    })

    // Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        res.send(swaggerSpec)
    })

    app.use(methodOverride())

    const controllers = fs.readdirSync(`${config.root}/app/controllers`).filter((f) => {
        return f.endsWith('.js')
    })
    controllers.forEach((controller) => {
        require(`${config.root}/app/controllers/${controller}`)(app, passport)
    })

    app.use((req, res) => {
        res.redirect('/')
    })

    app.use((err, req, res) => {
        return res.makeError(err.status || 500, err.message, err)
    })

    app.enable('trust proxy')
}