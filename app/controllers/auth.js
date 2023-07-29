const express = require('express'),
    router = express.Router(),
    config = require('./../../config/config'),
    authConfig = require('./../../config/auth'),
    morgan = require('../../config/middlewares/morgan'),
    logger = require('./../../config/log')(),
    auth = require('./../../config/middlewares/auth'),
    utils = require('../../utils'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    mailService = require('../services/mail'),
    User = mongoose.model('User'),
    Collection = mongoose.model('Collection'),
    Shortlink = mongoose.model('Shortlink'),
    Image = mongoose.model('Image')

function checkSignup(req, res, next) {
    if (!config.allowSignUp) return res.makeError(403, 'User registration is disabled by the server.')
    next()
}

// Set up mailing
const mail = function () {
    if (config.smtp.host) return mailService('smtp', config.smtp)
    if (config.mailwhale.clientId) return mailService('mailwhale', config.mailwhale)
    return mailService() // noop mail service
}()

module.exports = function (app, passport) {
    app.use('/api/auth', router)

    router.use(morgan())

    /**
     * @swagger
     * /auth/signup:
     *    post:
     *      summary: Sign up as a new user
     *      tags:
     *        - authentication
     *      parameters:
     *        - $ref: '#/parameters/userSignup'
     *      consumes:
     *        - application/json
     *      produces:
     *        - application/json
     *      responses:
     *          201:
     *            description: Successful
     */
    router.post('/signup', checkSignup, (req, res, next) => {
        passport.authenticate('local-signup', (err, user) => {
            if (err || !user) return res.makeError(400, err?.message || 'Unknown error during signup.', err)

            if (!config.verifyUsers) {
                return res.status(201).end()
            }

            user.generateToken()
            user.save()
                .then(() => {
                    sendConfirmationMail(user)
                        .then(() => {
                            res.status(201).end()
                        })
                        .catch((err) => {
                            logger.error(`Failed to send confirmation mail to user ${user.local.email} - ${err}`)
                            res.makeError(500, 'Failed to send confirmation mail.')
                        })
                })
                .catch((err) => {
                    res.makeError(500, err?.message || err)
                })

        })(req, res, next)
    })

    /**
     * @swagger
     * /auth/token:
     *    post:
     *      summary: Log in as an existing user and get a token
     *      tags:
     *        - authentication
     *      parameters:
     *        - $ref: '#/parameters/userLogin'
     *      consumes:
     *        - application/json
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: A new access token
     *            schema:
     *              type: object
     *              properties:
     *                token:
     *                  type: string
     */
    router.post('/token', (req, res, next) => {
        passport.authenticate('local-login', (err, user) => {
            if (err || !user) return res.makeError(401, err?.message || 'Unknown error during login.', err)

            res.status(200).send({ token: user.jwtSerialize('local') })
            initUser(user)
        })(req, res, next)
    })

    /**
     * @swagger
     * /auth/renew:
     *    post:
     *      summary: Renew the current user's token
     *      tags:
     *        - authentication
     *      security:
     *        - ApiKeyAuth: []
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: A new access token
     *            schema:
     *              type: object
     *              properties:
     *                token:
     *                  type: string
     */
    router.post('/renew', auth(passport), (req, res) => {
        if (!req.user) return res.makeError(404, 'User not found')
        res.status(200).send({ token: req.userObj.jwtSerialize('local') })
    })

    /**
     * @swagger
     * /auth/me:
     *    delete:
     *      summary: Delete the current user's account
     *      tags:
     *        - authentication
     *      security:
     *        - ApiKeyAuth: []
     *      produces:
     *        - application/json
     *      responses:
     *          204:
     *            description: Account deletion process successfully started
     */
    router.delete('/me', auth(passport), (req, res) => {
        if (!req.user) return res.makeError(404, 'User not found')
        deleteUserInBackground(req.userObj)
        res.status(204).end()
    })

    /**
     * @swagger
     * /auth/password:
     *    put:
     *      summary: Update the current user's password
     *      tags:
     *        - authentication
     *      parameters:
     *        - $ref: '#/parameters/passwordUpdate'
     *      consumes:
     *        - application/json
     *      security:
     *        - ApiKeyAuth: []
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: A new access token
     *            schema:
     *              type: object
     *              properties:
     *                token:
     *                  type: string
     */
    router.put('/password', auth(passport), (req, res) => {
        const user = req.userObj
        if (!user || !user.local) return res.makeError(404, 'User not found')
        if (!user.validPassword(req.body.old)) return res.makeError(401, 'Password wrong.')

        user.local.password = user.generateHash(req.body.new)
        user.save().catch((err) => {
            if (err) return res.makeError(500, err?.message || err)
            res.status(200).send({ token: user.jwtSerialize('local') })
        })
    })

    router.get('/verify', (req, res) => {
        if (!req.query.token) return res.makeError(400, 'Missing token.')

        User.findOne({ verificationToken: req.query.token })
            .then(user => {
                if (!user) throw new Error('failed to find user')
                user.verificationToken = null
                return user.save
                    .then(() => {
                        res.redirect(config.clientUrl)
                    })
                    .catch((err) => {
                        logger.error(`Failed to activate user by token ${req.query.token} - ${err}`)
                        res.makeError(500, 'Failed to activate user')
                    })
            })
            .catch(err => res.makeError(401, 'Invalid token.'))
    })

    if (authConfig.with('facebookAuth')) {
        router.get('/facebook', checkSignup, passport.authenticate('facebook', { scope: ['email'] }))

        router.get('/facebook/callback', (req, res, next) => {
            passport.authenticate('facebook', (err, user) => {
                if (!user) return res.makeError(401, 'Unauthorized.', err)

                res.redirect(`${config.clientUrl}auth/${user.jwtSerialize('facebook')}`)
                initUser(user)
            })(req, res, next)
        })
    }

    if (authConfig.with('googleAuth')) {
        router.get('/google', checkSignup, passport.authenticate('google', { scope: ['profile', 'email'] }))

        router.get('/google/callback', (req, res, next) => {
            passport.authenticate('google', (err, user) => {
                if (!user) return res.makeError(401, 'Unauthorized.', err)

                res.redirect(`${config.clientUrl}auth/${user.jwtSerialize('google')}`)
                initUser(user)
            })(req, res, next)
        })
    }
}

function initUser(user) {
    Collection.findOne({ name: config.shortlinkCollectionName, owner: user._id })
        .then(result => {
            if (!result) {
                return new Collection({
                    _id: utils.generateUUID(),
                    name: config.shortlinkCollectionName,
                    links: [],
                    owner: user._id,
                    shared: false
                }).save()
            }
        })
        .catch(err => logger.error(`Failed to init user - ${err}`))
}

function sendConfirmationMail(user) {
    let text = 'Welcome to Anchr.io!\n\n'
    text += 'Please confirm your e-mail address by clicking the following link:\n\n'
    text += `${config.publicUrl}/auth/verify?token=${user.verificationToken}\n\n`
    text += 'Thank you!'

    return mail.send({
        from: config.mailSender,
        to: user.local.email,
        subject: 'Confirm your Anchr.io account',
        text: text
    }).then(() => {
        logger.default(`Successfully sent confirmation mail to ${user.local.email}`)
        return true
    })
}

function deleteUserInBackground(user) {
    user.delete((err) => {
        if (err) return logger.error(`Failed to delete user "${user._id}" – ${err}`)
        logger.default(`Deleted user ${user._id}`)

        Collection.deleteMany({ owner: user._id })
            .then(() => logger.default(`Deleted collections of user ${user._id}`))
            .catch(err => logger.error(`Failed to delete collections user "${user._id}" – ${err}`))

        Shortlink.deleteMany({ createdBy: user._id })
            .then(() => logger.default(`Deleted shortlinks of user ${user._id}`))
            .catch(err => logger.error(`Failed to delete shortlinks user "${user._id}" – ${err}`))

        Image.find({ createdBy: user._id })
            .then(results => {
                results.forEach((file) => {
                    const filePath = config.uploadDir + file._id
                    fs.unlink(filePath, (err) => {
                        if (err) logger.error(`Failed to unlink file ${filePath}`)
                    })
                })

                return Image.deleteMany({ createdBy: user._id })
                    .then(() => logger.default(`Deleted images of user ${user._id}`))
                    .catch(err => logger.error(`Failed to delete images user "${user._id}" – ${err}`))
            })
            .catch(err => logger.error(`Failed to fetch images user "${user._id}" – ${err}`))
    })
}