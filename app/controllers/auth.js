var express = require('express'),
    router = express.Router(),
    config = require('./../../config/config'),
    authConfig = require('./../../config/auth'),
    log = require('./../../config/middlewares/log')(),
    auth = require('./../../config/middlewares/auth'),
    utils = require('../../utils'),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection');

function checkSignup(req, res, next) {
  if (!config.allowSignUp) return res.makeError(403, 'User registration is disabled by the server.')
  next()
}

module.exports = function(app, passport) {
    app.use('/api/auth', router);

    router.use(log);

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
    router.post('/signup', checkSignup, function(req, res, next) {
        passport.authenticate('local-signup', function(err, user) {
            if (err || !user) return res.makeError(400, err.message || 'Unknown error during signup.', err);

            res.status(201).end();
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
    router.post('/token', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
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
    router.post('/renew', auth(passport), function(req, res, next) {
        passport.authenticate('jwt', function(err, user) {
            if (err || !user) return res.makeError(401, err.message || 'Unknown error during login.', err);

            res.status(200).send({ token: user.jwtSerialize('local') });
        })(req, res, next);
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
    router.put('/password', auth(passport), function(req, res, next) {
        passport.authenticate('jwt', function(err, user) {
            if (!user || !user.local) return res.makeError(404, 'User not found');
            if (err) return res.makeError(401, err.message, err);
            if (!user.validPassword(req.body.old)) return res.makeError(401, 'Password wrong.', err);

            user.local.password = user.generateHash(req.body.new);
            user.save(function(err) {
                if (err) return res.makeError(500, err.message);
                res.status(200).send({ token: user.jwtSerialize('local') });
            })
        })(req, res, next);
    });

    if (authConfig.with('facebookAuth')) {
        router.get('/facebook', checkSignup, passport.authenticate('facebook', { scope: ['email'] }));

        router.get('/facebook/callback', function(req, res, next) {
            passport.authenticate('facebook', function(err, user) {
                if (!user) return res.makeError(401, 'Unauthorized.', err);

                res.redirect(config.clientUrl + 'auth/' + user.jwtSerialize('facebook'));
                initUser(user);
            })(req, res, next);
        });
    }

    if (authConfig.with('googleAuth')) {
        router.get('/google', checkSignup, passport.authenticate('google', { scope: ['profile', 'email'] }));

        router.get('/google/callback', function(req, res, next) {
            passport.authenticate('google', function(err, user) {
                if (!user) return res.makeError(401, 'Unauthorized.', err);

                res.redirect(config.clientUrl + 'auth/' + user.jwtSerialize('google'));
                initUser(user);
            })(req, res, next);
        });
    }
};

function initUser(user) {
    Collection.findOne({ name: 'My shortlinks', owner: user._id }, function(err, result) {
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