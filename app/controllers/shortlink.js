const express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    config = require('../../config/config'),
    Shortlink = mongoose.model('Shortlink'),
    Collection = mongoose.model('Collection'),
    morgan = require('./../../config/middlewares/morgan')(),
    logger = require('./../../config/log')(),
    auth = require('./../../config/middlewares/auth'),
    { addShortlink, scheduleCleanup } = require('./utils/shortlink')

if (!config.googleApiKey) {
    logger.default('[WARN] Disabling safe browse lookups for shortlinks as "ANCHR_GOOGLE_API_KEY" config variable is missing.')
}

scheduleCleanup()

module.exports = function (app, passport) {
    app.use('/api/shortlink', router)
    app.use('/s', router)

    router.use(morgan)

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
    router.get('/:id', (req, res) => {
        const asJson = req.get('accept') === 'application/json'

        Shortlink.findOne({ _id: req.params.id }, { __v: false, id: false, createdBy: false, created: false })
            .then(obj => {
                if (!obj) throw new Error('Not found.')
                if (!asJson && obj.url) {
                    // update counter asynchronously
                    const regex = new RegExp(`.*${req.params.id}$`, 'i')
                    Collection.findOneAndUpdate(
                        { name: config.shortlinkCollectionName, 'links.url': regex },
                        { $inc: { 'links.$.hits': 1 } },
                        {})
                        .catch(err => !!err && logger.error(err))

                    return res.redirect(obj.url)
                }

                res.send(obj.toObject())
            })
            .catch(err => res.makeError(404, 'Not found.'))
    })

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
    router.post('/', auth(passport), (req, res) => {
        if (!req.body.url) return res.makeError(400, 'Malformed request: You need to pass a url attribute.')

        addShortlink(req.body.url, req.user)
            .then(({ status, data }) => {
                res.status(status).send(data)
            })
            .catch(({ status, error }) => {
                res.makeError(status, error)
            })
    })
}