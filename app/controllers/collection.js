const express = require('express'),
    router = express.Router(),
    config = require('../../config/config'),
    utils = require('../../utils'),
    morgan = require('./../../config/middlewares/morgan')(),
    _ = require('underscore'),
    auth = require('./../../config/middlewares/auth'),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    fetchCollections = require('./utils/collection').fetchCollections,
    addLink = require('./utils/collection').addLink,
    fetchLinks = require('./utils/collection').fetchLinks,
    countLinks = require('./utils/collection').countLinks

const DEFAULT_PAGE_SIZE = 25

module.exports = function (app, passport) {
    app.use('/api/collection', router)
    router.use(auth(passport))

    router.use(morgan)

    /**
   * @swagger
   * /collection:
   *    get:
   *      summary: List all available collections for the current user
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: A list of available collections
   *            schema:
   *              $ref: '#/definitions/CollectionList'
   */
    router.get('/', (req, res) => {
        fetchCollections(req.user)
            .then(({ status, data }) => {
                res.status(status).send(data)
            })
            .catch((err) => {
                if (err.status) return res.makeError(err.status, (err.error.message || 'Unable get collections.'), err.error)
                res.makeError(500, err.message || err)
            })
    })

    /**
   * @swagger
   * /collection:
   *    post:
   *      summary: Create a new collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collection'
   *      consumes:
   *        - application/json
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: The newly created collection
   *            schema:
   *              $ref: '#/definitions/Collection'
   */
    router.post('/', (req, res) => {
        const name = req.body.name
        if (!name) return res.makeError(400, 'No collection name given.')

        new Collection({
            _id: utils.generateUUID(),
            name: name,
            created: new Date(),
            modified: new Date(),
            links: [],
            owner: req.user._id,
            shared: false,
        }).save((err, obj) => {
            if (err || !obj) return res.makeError(500, err.message || 'Unable to save new collection.', err)
            res.status(201).send(_.omit(obj.toObject(), '__v', 'created', 'modified'))
        })
    })

    /**
   * @swagger
   * /collection/{id}:
   *    get:
   *      summary: Get details about a collection including all links
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Details about the requested collection, excluding links
   *            schema:
   *              $ref: '#/definitions/Collection'
   */
    router.get('/:id', (req, res) => {
        const _id = req.params.id
        if (!_id) return res.makeError(404, 'Not found. Please give an id.')

        Collection.findOne({ _id: _id, owner: req.user._id }, { links: 0 }, (err, obj) => {
            if (err) return res.makeError(500, err.message, err)
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.')
            res.send(obj.toObject())
        })
    })

    /**
   * @swagger
   * /collection/{id}/links:
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
   *        - $ref: '#/parameters/q'
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
            fetchLinks({ _id: _id, owner: req.user._id }, req.query.q, pageSize, page),
            countLinks(_id, req.query.q),
        ]).then((results) => {
            const r1 = results[0]
            const r2 = results[1]

            if (r1.status === 'rejected') return res.makeError(500, r1.reason.message, r1.reason)
            if (!r1.value) return res.makeError(404, 'Collection not found or unauthorized.')

            const links = r1.value
            const count = r2.value || 0
            res.set('Link', `<?pageSize=${pageSize}&page=${Math.ceil(count / pageSize)}>; rel="last"`)
            res.send(links)
        }).catch((e) => {
            return res.makeError(500, e)
        })
    })

    /**
   * @swagger
   * /collection/{id}/links:
   *    post:
   *      summary: Add a new link to a collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *        - $ref: '#/parameters/link'
   *      consumes:
   *        - application/json
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: The newly added link
   *            schema:
   *              $ref: '#/definitions/Link'
   */
    router.post('/:id/links', (req, res) => {
        const _id = req.params.id,
            url = req.body.url,
            description = req.body.description || ''

        if (!_id) return res.makeError(404, 'Not found. Please give an id.')
        if (!url) return res.makeError(400, 'No link given.')

        const link = {
            url: url,
            description: description,
            date: Date.now(),
        }

        addLink(link, _id, req.user)
            .then(({ status, data }) => {
                res.status(status).send(data)
            })
            .catch((err) => {
                if (err.status) return res.makeError(err.status, (err.error.message || 'Unable to save new link.'), err.error)
                res.makeError(500, err.message || err)
            })
    })

    router.post('/shortlinks', (req, res) => {
        const url = req.body.url,
            description = req.body.description || ''

        if (!url) return res.makeError(400, 'No link given.')

        const link = {
            url: url,
            description: description,
            date: Date.now(),
        }

        Collection.findOneAndUpdate(
            {
                name: config.shortlinkCollectionName,
                owner: req.user._id,
            },
            {
                $push: { links: link },
                modified: new Date(),
            },
            {
                returnDocument: 'after',
                lean: true,
                projection: {
                    links: { $elemMatch: { date: link.date } },
                },
            },
            (err, obj) => {
                if (err) return res.makeError(500, err.message || 'Unable to save new link.', err)
                if (!obj || !obj.links.length) return res.makeError(404, 'Collection not found or unauthorized.')
                return res.status(201).send(obj.links[0])
            }
        )
    })

    /**
   * @swagger
   * /collection/{id}:
   *    delete:
   *      summary: Delete a given collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Successful
   */
    router.delete('/:id', (req, res) => {
        const _id = req.params.id
        if (!_id) return res.makeError(404, 'Not found. Please give an id.')

        Collection.remove({ _id: _id, owner: req.user._id }, (err) => {
            if (err) return res.makeError(500, err.message, err)
            res.status(200).end()
        })
    })

    /**
   * @swagger
   * /collection/{id}/links/{linkId}:
   *    delete:
   *      summary: Delete a link from a given collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *        - $ref: '#/parameters/linkId'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Successful
   */
    router.delete('/:id/links/:linkId', (req, res) => {
        const _id = req.params.id,
            linkId = req.params.linkId
        if (!_id || !linkId) return res.makeError(404, 'Not found. Please give an id.')

        Collection.updateOne({ _id: _id, owner: req.user._id }, { $pull: { links: { _id: linkId } } },
            (err) => {
                if (err) return res.makeError(500, err.message, err)
                return res.status(200).end()
            }
        )
    })

    /**
   * @swagger
   * /collection/{id}/links/{linkId}:
   *    get:
   *      summary: Get details about a link in a collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *        - $ref: '#/parameters/linkId'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Details about the requested link
   *            schema:
   *              $ref: '#/definitions/Link'
   */
    router.get('/:id/links/:linkId', (req, res) => {
        const _id = req.params.id,
            linkId = req.params.linkId
        if (!_id || !linkId) return res.makeError(404, 'Not found. Please give an id.')

        Collection.findOne(
            { _id: _id, owner: req.user._id },
            { __v: false, links: { $elemMatch: { _id: linkId } } },
            (err, obj) => {
                if (err) return res.makeError(500, err.message, err)
                if (!obj || !obj.links.length) return res.makeError(404, 'Collection or link not found or unauthorized.')
                return res.send(obj.links[0])
            }
        )
    })

    /**
   * @swagger
   * /collection/{id}:
   *    patch:
   *      summary: Incrementally update details of a given collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *        - $ref: '#/parameters/collectionDetails'
   *      consumes:
   *        - application/json
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Successful
   */
    router.patch('/:id', (req, res) => {
        const _id = req.params.id
        if (!_id) return res.makeError(404, 'Not found. Please give an id.')

        const updateFields = {
            modified: new Date(),
        }
        if (req.body.hasOwnProperty('shared')) updateFields.shared = req.body.shared
        if (req.body.hasOwnProperty('name')) updateFields.name = req.body.name

        if (!Object.keys(updateFields).length) return res.status(200).end()

        Collection.updateOne({ _id: _id, owner: req.user._id }, updateFields, (err, num) => {
            if (err) return res.makeError(500, err.message, err)
            if (!num || !num.modifiedCount) return res.makeError(404, 'Collection not found or unauthorized.')
            res.status(200).end()
        }
        )
    })

    router.delete('/', (req, res) => {
        res.makeError(404, 'Not found. Please give an id.')
    })

    router.delete('/:id/links', (req, res) => {
        res.makeError(404, 'Not found. Please give an id.')
    })
}