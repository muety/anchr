var express = require('express'),
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
    Image = mongoose.model('Image');

function checkSignup(req, res, next) {
    if (!config.allowSignUp) return res.makeError(403, 'User registration is disabled by the server.')
    next()
}

// Set up mailing
var mail = function() {
    if (config.smtp.host) return mailService('smtp', config.smtp);
    if (config.mailwhale.clientId) return mailService('mailwhale', config.mailwhale);
    return mailService(); // noop mail service
}()

module.exports = function (app, passport) {
    app.use('/api/auth', router);

    router.use(morgan());

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
    router.post('/signup', checkSignup, function (req, res, next) {
        passport.authenticate('local-signup', function (err, user) {
            if (err || !user) return res.makeError(400, err.message || 'Unknown error during signup.', err);

            if (!config.verifyUsers) {
                return res.status(201).end();
            }

            user.generateToken();
            user.save(function () {
                sendConfirmationMail(user)
                    .then(function () {
                        res.status(201).end();
                    })
                    .catch(function (err) {
                        logger.error('Failed to send confirmation mail to user ' + user.local.email + ' - ' + err);
                        res.makeError(500, 'Failed to send confirmation mail.');
                    });
            }, function (err) {
                res.makeError(500, err.message);
            })

        })(req, res, next);
    });

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
    router.post('/token', function (req, res, next) {
        passport.authenticate('local-login', function (err, user) {
            if (err || !user) return res.makeError(401, err.message || 'Unknown error during login.', err);

            res.status(200).send({ token: user.jwtSerialize('local') });
            initUser(user);
        })(req, res, next);
    });

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
    router.post('/renew', auth(passport), function (req, res) {
        if (!req.user) return res.makeError(404, 'User not found');
        res.status(200).send({ token: req.userObj.jwtSerialize('local') });
    });

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
    router.delete('/me', auth(passport), function (req, res) {
        if (!req.user) return res.makeError(404, 'User not found');
        deleteUserInBackground(req.userObj);
        res.status(204).end();
    });

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
    router.put('/password', auth(passport), function (req, res) {
        var user = req.userObj
        if (!user || !user.local) return res.makeError(404, 'User not found');
        if (!user.validPassword(req.body.old)) return res.makeError(401, 'Password wrong.');

        user.local.password = user.generateHash(req.body.new);
        user.save(function (err) {
            if (err) return res.makeError(500, err.message);
            res.status(200).send({ token: user.jwtSerialize('local') });
        })
    });

    router.get('/verify', function (req, res) {
        if (!req.query.token) return res.makeError(400, 'Missing token.', err);

        User.findOne({ verificationToken: req.query.token }, function (err, user) {
            if (err || !user) return res.makeError(401, 'Invalid token.');
            user.verificationToken = null;
            user.save(function () {
                res.redirect(config.clientUrl);
            }, function(err) {
                logger.error('Failed to activate user by token ' + req.query.token + ' - ' + err);
                res.makeError(500, 'Failed to activate user');
            });
        });
    });

    if (authConfig.with('facebookAuth')) {
        router.get('/facebook', checkSignup, passport.authenticate('facebook', { scope: ['email'] }));

        router.get('/facebook/callback', function (req, res, next) {
            passport.authenticate('facebook', function (err, user) {
                if (!user) return res.makeError(401, 'Unauthorized.', err);

                res.redirect(config.clientUrl + 'auth/' + user.jwtSerialize('facebook'));
                initUser(user);
            })(req, res, next);
        });
    }

    if (authConfig.with('googleAuth')) {
        router.get('/google', checkSignup, passport.authenticate('google', { scope: ['profile', 'email'] }));

        router.get('/google/callback', function (req, res, next) {
            passport.authenticate('google', function (err, user) {
                if (!user) return res.makeError(401, 'Unauthorized.', err);

                res.redirect(config.clientUrl + 'auth/' + user.jwtSerialize('google'));
                initUser(user);
            })(req, res, next);
        });
    }
};

function initUser(user) {
    Collection.findOne({ name: 'My shortlinks', owner: user._id }, function (err, result) {
        if (err) return res.makeError(500, err.message, err);
        if (result) return true;
        else {
            new Collection({
                _id: utils.generateUUID(),
                name: 'My shortlinks',
                links: [],
                owner: user._id,
                shared: false
            }).save();
        }
    });
}

function sendConfirmationMail(user) {
    var text = 'Welcome to Anchr.io!\n\n';
    text += 'Please confirm your e-mail address by clicking the following link:\n\n';
    text += config.publicUrl + '/auth/verify?token=' + user.verificationToken + '\n\n';
    text += 'Thank you!';

    return mail.send({
        from: config.mailSender,
        to: user.local.email,
        subject: 'Confirm your Anchr.io account',
        text: text
    }).then(function (res) {
        logger.default('Successfully sent confirmation mail to ' + user.local.email);
        return true;
    })
}

function deleteUserInBackground(user) {
    user.delete(function (err) {
        if (err) return logger.error('Failed to delete user "' + user._id + '" – ' + err);
        logger.default('Deleted user ' + user._id);

        Collection.deleteMany({ owner: user._id }, function (err) {
            if (err) return logger.error('Failed to delete collections user "' + user._id + '" – ' + err);
            logger.default('Deleted collections of user ' + user._id);
        });

        Shortlink.deleteMany({ createdBy: user._id }, function (err) {
            if (err) return logger.error('Failed to delete shortlinks user "' + user._id + '" – ' + err);
            logger.default('Deleted shortlinks of user ' + user._id);
        });

        Image.find({ createdBy: user._id }, function (err, results) {
            if (err) return logger.error('Failed to fetch images user "' + user._id + '" – ' + err);
            results.forEach(function (file) {
                var filePath = config.uploadDir + file._id;
                fs.unlink(filePath, function (err) {
                    if (err) logger.error('Failed to unlink file ' + filePath);
                });
            });

            Image.deleteMany({ createdBy: user._id }, function (err) {
                if (err) return logger.error('Failed to delete images user "' + user._id + '" – ' + err);
                logger.default('Deleted images of user ' + user._id);
            });
        });
    });
}