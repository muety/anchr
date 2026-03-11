const express = require('express'),
    router = express.Router(),
    morgan = require('../../config/middlewares/morgan')(),
    logger = require('./../../config/log')(),
    auth = require('./../../config/middlewares/auth'),
    PageMetaService = require('../services/page_meta')

const pageMetaService = new PageMetaService()

module.exports = function (app, passport) {
    app.use('/api/remote', router)

    router.use(morgan)

    /**
     * @swagger
     * /remote/page:
     *    get:
     *      summary: Get a remote HTML website's title
     *      tags:
     *        - remote
     *      security:
     *        - ApiKeyAuth: []
     *      parameters:
     *        - $ref: '#/parameters/remoteUrl'
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: The target website's title
     *            schema:
     *              type: object
     *              properties:
     *                title:
     *                  type: string
     *                  description: Website title
     */
    router.get('/page', auth(passport), (req, res) => {
        const url = req.query.url

        if (!url || !url.length) return res.makeError(400, 'No url given')

        pageMetaService
            .fetchTitle(url)
            .then((title) => {
                return res.send({ title })
            })
            .catch((err) => {
                logger.error(`Failed to resolve title for URL ${url} - ${err}`)
                return res.makeError(404, 'Not found')
            })
    })
}
