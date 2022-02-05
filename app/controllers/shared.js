const express = require('express'),
    router = express.Router(),
    morgan = require('./../../config/middlewares/morgan')(),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    fetchLinks = require('./utils/collection').fetchLinks,
    countLinks = require('./utils/collection').countLinks

const DEFAULT_PAGE_SIZE = 25

module.exports = function (app) {
    app.use('/api/shared', router)

    router.use(morgan)

    /**
   * @swagger
   * /shared/{id}:
   *    get:
   *      summary: Get details about a shared collection including all links
   *      tags:
   *        - collection
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Details about the requested collection, excluding links
   *            schema:
   *              $ref: '#/definitions/CollectionDetails'
   */
    router.get('/:id', (req, res) => {
        const _id = req.params.id
        if (!_id) return res.makeError(404, 'Not found. Please give an id.')

        Collection.findOne({ _id: _id, shared: 1 }, { links: 0 }, (err, obj) => {
            if (err) return res.makeError(500, err?.message, err)
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.')
            res.send(obj.toObject())
        })
    })

    /**
   * @swagger
   * /shared/{id}/links:
   *    get:
   *      summary: Get links contained in a collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *        - $ref: '#/parameters/page'
   *        - $ref: '#/parameters/pageSize'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: List of links in the collection
   *            schema:
   *              $ref: '#/definitions/LinkList'
   */
    router.get('/:id/links', (req, res) => {
        const _id = req.params.id
        if (!_id) return res.makeError(404, 'Not found. Please give an id.')

        const page = Math.max(req.query.page, 1)
        const pageSize = Math.max(req.query.pageSize, 0) || DEFAULT_PAGE_SIZE

        Promise.allSettled([
            fetchLinks({ _id: _id, shared: true }, req.query.q, pageSize, page),
            countLinks(_id, req.query.q),
        ]).then((results) => {
            const r1 = results[0]
            const r2 = results[1]

            if (r1.status === 'rejected') return res.makeError(500, r1.reason.message, r1.reason)
            if (!r1.value) return res.makeError(404, 'Collection not found or unauthorized.')

            const links = r1.value
            if (r2.status === 'fulfilled') {
                res.set('Link', `<?pageSize=${pageSize}&page=${Math.ceil(r2.value / pageSize)}>; rel="last"`)
            }
            res.send(links)
        }).catch((e) => {
            return res.makeError(500, e)
        })
    })
}