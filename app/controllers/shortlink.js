var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    config = require('../../config/config'),
    safeBrowseLookup = require('safe-browse-url-lookup'),
    Shortlink = mongoose.model('Shortlink'),
    utils = require('../../utils'),
    morgan = require('./../../config/middlewares/morgan')(),
    logger = require('./../../config/log')()
    _ = require('underscore'),
    auth = require('./../../config/middlewares/auth');

var blacklist = [/.*bit\.ly.*/gi, /.*goo\.gl.*/gi, /.*confirm.*/gi, /.*verif.*/gi, /.*account.*/gi, /.*secur.*/gi];

var lookup = config.googleApiKey
    ? safeBrowseLookup({ apiKey: config.googleApiKey, clientId: 'anchr.io' })
    : { checkSingle: function() { return Promise.resolve(false) } }

if (!config.googleApiKey) {
    logger.default('[WARN] Disabling safe browse lookups for shortlinks as "ANCHR_GOOGLE_API_KEY" config variable is missing.');
}

module.exports = function(app, passport) {
    app.use('/api/shortlink', router);
    app.use('/s', router);

    router.use(morgan);

    /**
     * @swagger
     * /shortlink/{id}:
     *    get:
     *      summary: Get or resolve a shortlink
     *      tags:
     *        - shortlink
     *      parameters:
     *        - $ref: '#/parameters/shortlinkId'
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: The shortlink's meta data object
     *            schema:
     *              $ref: '#/definitions/Shortlink'
     *          302:
     *            description: Redirect to the shortlinks target URL (returned if `Accept` header is NOT `application/json`)
     */
    router.get('/:id', function(req, res, next) {
        var asJson = req.get('accept') === 'application/json';

        Shortlink.findOne({ _id: req.params.id }, { __v: false, id: false, createdBy: false, created: false }, function(err, obj) {
            if (err || !obj) return res.makeError(404, "Not found.");
            if (!asJson && obj.url) res.redirect(obj.url);
            else res.send(obj.toObject());
        });
    });

    /**
     * @swagger
     * /shortlink:
     *    post:
     *      summary: Create a new shortlink
     *      tags:
     *        - shortlink
     *      security:
     *        - ApiKeyAuth: []
     *      parameters:
     *        - $ref: '#/parameters/shortlink'
     *      consumes:
     *        - application/json
     *      produces:
     *        - application/json
     *      responses:
     *          201:
     *            description: The newly created shortlink's meta data object
     *            schema:
     *              $ref: '#/definitions/ShortlinkShort'
     */
    router.post('/', auth(passport), function(req, res, next) {
        if (!req.body.url) return res.makeError(400, 'Malformed request: You need to pass a url attribute.');

        for (var i = 0; i < blacklist.length; i++) {
            if (blacklist[i].test(req.body.url)) return res.makeError(400, 'The link you try to reference is not safe!');
        }

        lookup.checkSingle(req.body.url)
            .then(isMalicious => {
                if (isMalicious) return res.makeError(400, 'The link you try to reference is not safe!');
                var shortlink = new Shortlink({
                    url: req.body.url,
                    _id: utils.generateUUID(),
                    created: Date.now(),
                    createdBy: req.user._id
                });
                shortlink.save(function(err, obj) {
                    if (err) return res.makeError(500, 'Unable to save shortlink to database.', err);
                    res.status(201).send(_.omit(obj.toObject(), '__v', 'id', 'createdBy', 'created'));
                });
            })
            .catch(err => {
                return res.makeError(500, 'Something went wrong.' + err);
            });
    });
};