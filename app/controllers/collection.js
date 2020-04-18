var express = require('express'),
    router = express.Router(),
    utils = require('../../utils'),
    log = require('./../../config/middlewares/log')(),
    _ = require('underscore'),
    jwtAuth = require('./../../config/middlewares/jwtauth'),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection');

module.exports = function(app, passport) {
    app.use('/api/collection', router);
    router.use(jwtAuth(passport));
    router.use(log);

    router.get('/', function(req, res) {
        Collection.find({ owner: req.user._id }, '_id name', function(err, result) {
            if (err) return res.makeError(500, err.message, err);
            res.send(result);
        });
    });

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

    router.get('/:id', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.', err);

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: false, created: false, modified: false }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');
            res.send(obj);
        });
    });

    router.get('/:id/links', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: false }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');
            res.send(obj.links);
        });
    });

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

    router.delete('/:id', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        Collection.remove({ _id: _id, owner: req.user._id }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            res.status(200).end();
        });
    });

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