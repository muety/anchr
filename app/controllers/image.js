var express = require('express'),
    router = express.Router(),
    fs = require('fs'),
    path = require('path'),
    config = require('../../config/config'),
    utils = require('../../utils'),
    log = require('./../../config/middlewares/log')(),
    _ = require('underscore'),
    jwtAuth = require('./../../config/middlewares/jwtauth'),
    mongoose = require('mongoose'),
    Image = mongoose.model('Image');

module.exports = function(app, passport) {
    app.use('/api/image', router);
    app.use('/i', router);
    router.use(log);

    router.get('/:id', function(req, res) {
        var asJson = req.query.json;

        Image.findOne({ _id: req.params.id }, { __v: 0, ip: 0 }, function(err, obj) {
            if (err) return res.makeError(500, err.message, err);
            if (!obj) return res.makeError(404, 'Image not found.');

            var filePath = config.uploadDir + obj._id;
            fs.exists(filePath, function(exists) {
                if (!exists) return res.makeError(404, "File not found.");
                if (asJson) res.send(_.omit(obj.toObject(), 'id'));
                else res.sendFile(filePath);
            });
        });
    });

    router.post('/', jwtAuth(passport), function(req, res) {
        var FILE_UPLOAD_FIELD = "uploadFile";

        var tmpPath = req.files[FILE_UPLOAD_FIELD].path;
        var newName = utils.generateUUID() + path.parse(tmpPath).ext;
        var newPath = config.uploadDir + newName;

        fs.rename(tmpPath, newPath, function(err) {
            if (err) return res.makeError(500, 'Unable to save file.', err);

            var img = new Image({
                _id: newName,
                created: Date.now(),
                ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
                encrypted: req.body.encrypted || false,
                type: req.files[FILE_UPLOAD_FIELD].type,
                createdBy: req.user._id
            });

            img.save(function(err, obj) {
                if (err) return res.makeError(500, 'Unable to save file.', err);
                res.status(201).send(_.omit(img.toObject(), '__v', 'ip', 'id', 'createdBy'));
            });
        })
    });
};