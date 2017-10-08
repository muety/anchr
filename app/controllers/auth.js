var express = require('express'),
    router = express.Router(),
    jwt = require('jsonwebtoken'),
    config = require('./../../config/config'),
    log = require('./../../config/middlewares/log')(),
    jwtAuth = require('./../../config/middlewares/jwtauth'),
    utils = require('../../utils'),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection');

module.exports = function(app, passport) {
    app.use('/api/auth', router);

    router.use(log);

    router.post('/signup', function(req, res, next) {
        passport.authenticate('local-signup', function(err, user) {
            if (err || !user) return res.makeError(400, err.message || 'Unknown error during signup.', err);

            res.status(201).end();
        })(req, res, next);
    });

    router.post('/token', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
            if (err || !user) return res.makeError(400, err.message || 'Unknown error during login.', err);

            res.status(200).send({ token: user.jwtSerialize('local') });
            initUser(user);
        })(req, res, next);
    });

    router.post('/renew', function(req, res, next) {
        passport.authenticate('jwt', function(err, user) {
            if (err || !user) return res.makeError(400, err.message || 'Unknown error during login.', err);

            res.status(200).send({ token: user.jwtSerialize('local') });
            initUser(user);
        })(req, res, next);
    });

    router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

    router.get('/facebook/callback', function(req, res, next) {
        passport.authenticate('facebook', function(err, user) {
            if (!user) return res.makeError(401, 'Unauthorized.', err, true);

            res.redirect(config.clientUrl + 'auth/' + user.jwtSerialize('facebook'));
            initUser(user);
        })(req, res, next);
    });

    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    router.get('/google/callback', function(req, res, next) {
        passport.authenticate('google', function(err, user) {
            if (!user) return res.makeError(401, 'Unauthorized.', err, true);

            res.redirect(config.clientUrl + 'auth/' + user.jwtSerialize('google'));
            initUser(user);
        })(req, res, next);
    });
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