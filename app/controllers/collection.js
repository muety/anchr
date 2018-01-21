var express = require('express'),
    router = express.Router(),
    config = require('../../config/config'),
    utils = require('../../utils'),
    log = require('./../../config/middlewares/log')(),
    _ = require('underscore'),
    jwtAuth = require('./../../config/middlewares/jwtauth'),
    mongoose = require('mongoose'),
    BMParser = require('bookmark-parser'),
    Collection = mongoose.model('Collection');

module.exports = function(app, passport) {
    app.use('/api/collection', router);
    router.use(jwtAuth(passport));
    router.use(log);

    router.get('/', function(req, res) {
        var selection = req.query.short ? '_id name' : { __v: 0 };
        Collection.find({ owner: req.user._id }, selection, function(err, result) {
            if (err) return res.makeError(500, err.message, err);
            res.send(result);
        });
    });

    router.post('/', function(req, res) {
        console.log(req.user);
        var name = req.body.name;
        if (!name) return res.makeError(400, 'No collection name given.', err);

        new Collection({
            _id: utils.generateUUID(),
            name: name,
            links: [],
            owner: req.user._id,
            shared: false
        }).save(function(err, obj) {
            if (err || !obj) return res.makeError(500, err.message || 'Unable to save new collection.', err);
            res.status(201).send(_.omit(obj.toObject(), '__v'));
        });
    });

    router.get('/:id', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.', err);

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: 0 }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');
            res.send(obj);
        });
    });

    router.get('/:id/links', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: 0 }, function(err, obj) {
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

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: 0 }, function(err, obj) {
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

        Collection.findOne({ _id: _id, owner: req.user._id }, { __v: 0 }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Collection not found or unauthorized.');

            for (var i = 0; i < obj.links.length; i++) {
                if (obj.links[i]._id == linkId) {
                    return res.send(obj.links[i]);
                }
            }
        });
    });

    router.post('/:id/share', function(req, res) {
        var _id = req.params.id;
        if (!_id) return res.makeError(404, 'Not found. Please give an id.');

        Collection.update({ _id: _id, owner: req.user._id }, { shared: 1 }, function(err, num) {
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

    router.post('/import', jwtAuth(passport), function (req, res) {
        var FILE_UPLOAD_FIELD = "uploadFile";

        var tmpPath = req.files[FILE_UPLOAD_FIELD].path;
        BMParser.readFromHTMLFile(tmpPath).then(res => {
            parseBookmarks(req.user._id, res, '', res.Bookmarks);
        });

        res.status(201).send();
    });

};


function parseBookmarks(uname, res, root, bookmarks) {
    var name = root == '' || root == undefined ? bookmarks.name : root + ' › ' + bookmarks.name;
    var linkSet = [];
    bookmarks.children.forEach(function (bookmark) {
        if (bookmark.type == 'folder') {
            parseBookmarks(uname, res, name, bookmark);
        } else {
            // Add to obj
            linkSet.push({
                url: bookmark.url,
                description: bookmark.name,
                date: bookmark.lastModified
            });
        }
    });

    if (linkSet.length > 0) {
        Collection.findOne({ name: name, owner: uname }, function (err, obj) {
            if (err) console.log('ERR:', err); //return res.makeError(500, err.message, err);
            if (!obj) {
                new Collection({
                    _id: utils.generateUUID(),
                    name: name,
                    links: linkSet,
                    owner: uname,
                    shared: false
                }).save(function (err, obj) {
                    if (err || !obj) console.log('ERR:', err);// return res.makeError(500, err.message || 'Unable to save new collection.', err);
                    // res.status(201).send(_.omit(obj.toObject(), '__v'));
                });
            } else {
                obj.links = obj.links.concat(linkSet);
                obj.save(function (err) {
                    if (err) console.log('ERR:', err);//return res.makeError(500, err.message, err);
                    // res.status(201).end();
                });
            }
        });
    }
}