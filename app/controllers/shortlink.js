var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    config = require('../../config/config'),
    lookup = require('safe-browse-url-lookup')({ apiKey: config.googleApiKey, clientId: 'anchr.io' }),
    Shortlink = mongoose.model('Shortlink'),
    utils = require('../../utils'),
    log = require('./../../config/middlewares/log')(),
    _ = require('underscore')
jwtAuth = require('./../../config/middlewares/jwtauth');

var blacklist = [/.*bit\.ly.*/gi, /.*goo\.gl.*/gi, /.*confirm.*/gi, /.*verif.*/gi, /.*account.*/gi, /.*secur.*/gi];

module.exports = function(app, passport) {
    app.use('/api/shortlink', router);
    app.use('/s', router);
    router.use(jwtAuth(passport));
    router.use(log);

    router.get('/:id', function(req, res, next) {
        var asJson = req.query.json;

        Shortlink.findOne({ _id: req.params.id }, { __v: 0 }, function(err, obj) {
            if (err || !obj) return res.makeError(404, "Not found.");
            if (!asJson && obj.url) res.redirect(obj.url);
            else res.send(_.omit(obj.toObject(), '__v', 'id'));
        });
    });

    router.post('/', function(req, res, next) {
        if (!req.body.url) return res.makeError(400, 'Malformed request: You need to pass a url attribute.');

        for (var i = 0; i < blacklist.length; i++) {
            if (blacklist[i].test(req.body.url)) return res.makeError(400, 'The link you try to reference is not safe!');
        }

        lookup.checkSingle(req.body.url)
            .then(isMalicious => {
                if (isMalicious) return res.makeError(400, 'The link you try to reference is not safe!');
                var shortlink = new Shortlink({
                    url: req.body.url,
                    _id: utils.generateUUID()
                });
                shortlink.save(function(err, obj) {
                    if (err) return res.makeError(500, 'Unable to save shortlink to database.', err);
                    res.status(201).send(_.omit(obj.toObject(), '__v', 'id'));
                });
            })
            .catch(err => {
                return res.makeError(500, 'Something went wrong.' + err);
            });
    });
};