var express = require('express'),
    router = express.Router(),
    utils = require('../../utils'),
    log = require('./../../config/middlewares/log')(),
    _ = require('underscore'),
    auth = require('./../../config/middlewares/auth'),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection');

module.exports = function(app, passport) {
    app.use('/api/collection', router);
    router.use(auth(passport));
    router.use(log);

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
    router.get('/', function(req, res) {
        Collection.find({ owner: req.user._id }, '_id name shared', function(err, result) {
            if (err) return res.makeError(500, err.message, err);
            res.send(result);
        });
    });

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
    router.post('/', function(req, res) {
        var name = req.body.name;
        if (!name) return res.makeError(400, 'No collection name given.', err);

        new Collection({
            _id: utils.generateUUID(),
            name: name,
            created: new Date(),
            modified: new Date(),
            links: [],
            owner: req.user._id,
            shared: false
        }).save(function(err, obj) {
            if (err || !obj) return res.makeError(500, err.message || 'Unable to save new collection.', err);
            res.status(201).send(_.omit(obj.toObject(), '__v', 'created', 'modified'));
        });
    });

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
     *            description: Details about the requested collection
     *            schema:
     *              $ref: '#/definitions/CollectionDetails'
     */
    router.get('/:id', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.', err);

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: false, created: false, modified: false }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');
            res.send(obj);
        });
    });

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
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: List of links in the collection
     *            schema:
     *              $ref: '#/definitions/LinkList'
     */
    router.get('/:id/links', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: false }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');
            res.send(obj.links);
        });
    });

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
    router.post('/:id/links', function(req, res) {
        var _id = req.params.id,
            url = req.body.url,
            description = req.body.description || '';

        if (!_id) return res.makeError(404, 'Not found. Please give an id.');
        if (!url) return res.makeError(400, 'No link given.');

        var link = {
            url: url,
            description: description,
            date: Date.now()
        };

        Collection.findOne({ _id: _id, owner: req.user._id }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');

            obj.modified = new Date();
            obj.links.push(link);
            obj.save(function(err, obj) {
                if (err || !obj) return res.makeError(500, err.message || 'Unable to save new link.', err);
                var savedLink = _.last(_.sortBy(obj.toObject().links.filter(function(l) {
                    return l.url === link.url && l.description === link.description;
                }), 'date'));
                res.status(201).send(savedLink);
            });
        });
    });

    router.post('/shortlinks', function(req, res) {
        var url = req.body.url,
            description = req.body.description || '';

        if (!url) return res.makeError(400, 'No link given.');

        var link = {
            url: url,
            description: description,
            date: Date.now()
        };

        Collection.findOne({ name: 'My shortlinks', owner: req.user._id }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');

            obj.modified = new Date();
            obj.links.push(link);
            obj.save(function(err) {
                if (err) return res.makeError(500, err.message, err);
                res.status(201).end();
            });
        });
    });

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
    router.delete('/:id', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        Collection.remove({ _id: _id, owner: req.user._id }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            res.status(200).end();
        });
    });

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
    router.delete('/:id/links/:linkId', function(req, res) {
        var _id = req.params.id,
            linkId = req.params.linkId;
        if (!_id || !linkId) return res.makeError(404, 'Not found. Please give an id.');

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: false }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');

            var links = obj.toObject().links.slice();

            for (var i = 0; i < links.length; i++) {
                if (links[i]._id == linkId) {
                    links.splice(i, 1);
                    break;
                }
            }

            obj.links = links;

            obj.save(function(err) {
                if (err) return res.makeError(500, err.message, err);
                res.status(200).end();
            });
        });
    });

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
    router.get('/:id/links/:linkId', function(req, res) {
        var _id = req.params.id,
            linkId = req.params.linkId;
        if (!_id || !linkId) return res.makeError(404, 'Not found. Please give an id.');

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: false }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');

            for (var i = 0; i < obj.links.length; i++) {
                if (obj.links[i]._id == linkId) {
                    return res.send(obj.links[i]);
                }
            }
        });
    });

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
    router.patch('/:id', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        var updateFields = {
            modified: new Date()
        };
        if (req.body.hasOwnProperty('shared')) updateFields.shared = req.body.shared;
        if (req.body.hasOwnProperty('name')) updateFields.name = req.body.name;

        if (!Object.keys(updateFields).length) return res.status(200).end();

        Collection.update({ _id: _id, owner: req.user._id }, updateFields, function(err, num) {
            if (err) return res.makeError(500, err.message, err);
            if (!num || !num.nModified) return res.makeError(404, 'Collection not found or unauthorized.');
            res.status(200).end();
        });
    });

    router.delete('/', function(req, res) {
        res.makeError(404, 'Not found. Please give an id.');
    });

    router.delete('/:id/links', function(req, res) {
        res.makeError(404, 'Not found. Please give an id.');
    });

};