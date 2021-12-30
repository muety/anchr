var express = require('express'),
    router = express.Router(),
    morgan = require('../../config/middlewares/morgan')(),
    config = require('./../../config/config')
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    User = mongoose.model('User'),
    Image = mongoose.model('Image'),
    Shortlink = mongoose.model('Shortlink'),
    prom = require('prom-client'),
    du = require('du')

var PREFIX = 'anchr_';

function initPromClient() {
    prom.collectDefaultMetrics({
        gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
        prefix: PREFIX,
    });

    var gTotalUsers = new prom.Gauge({
        name: `${PREFIX}users_total`,
        help: "Total number of registered users",
        labelNames: []
    });

    gTotalUsers.collect = function() {
        return new Promise(function (resolve, reject) {
            count('user', null, function (count) {
                gTotalUsers.set(count);
                resolve();
            });
        })
    };

    var gTotalCollections = new prom.Gauge({
        name: `${PREFIX}collections_total`,
        help: "Total number of link collections",
        labelNames: []
    });

    gTotalCollections.collect = function() {
        return new Promise(function (resolve, reject) {
            count('collection', null, function (count) {
                gTotalCollections.set(count);
                resolve();
            })
        })
    };

    var gTotalShortlinks = new prom.Gauge({
        name: `${PREFIX}shortlinks_total`,
        help: "Total number of shortlinks",
        labelNames: []
    });

    gTotalShortlinks.collect = function() {
        return new Promise(function (resolve, reject) {
            count('shortlink', null, function (count) {
                gTotalShortlinks.set(count)
                resolve()
            });
        })
    };

    var gTotalImages = new prom.Gauge({
        name: `${PREFIX}images_total`,
        help: "Total number of uploaded images",
        labelNames: ['encryption']
    });

    gTotalImages.collect = function() {
        return Promise.all([
            new Promise(function (resolve, reject) {
                count('image', { encrypted: false }, function (count) {
                    gTotalImages.set({ encryption: false }, count);
                    resolve();
                });
            }),
            new Promise(function (resolve, reject) {
                count('image', { encrypted: true }, function (count) {
                    gTotalImages.set({ encryption: true }, count);
                    resolve();
                });
            })
        ]);
    };

    var gTotalLinks = new prom.Gauge({
        name: `${PREFIX}links_total`,
        help: "Total number of links among all collections",
        labelNames: []
    });

    gTotalLinks.collect = function() {
        return new Promise(function (resolve, reject) {
            countLinks(function (count) {
                gTotalLinks.set(count)
                resolve()
            });
        })
    };

    var gTotalImageSize = new prom.Gauge({
        name: `${PREFIX}images_size_total_bytes`,
        help: "Total size of all images stored in the file system",
        labelNames: []
    });

    gTotalImageSize.collect = function() {
        return new Promise(function (resolve, reject) {
            return du(config.uploadDir, function (err, size) {
                gTotalImageSize.set(err ? -1 : size)
                resolve()
            });
        })
    };
}

function count(type, select, cb) {
    var model = null
    
    switch (type) {
        case 'user':
            model = User
            break
        case 'collection':
            model = Collection
            break
        case 'shortlink':
            model = Shortlink
            break
        case 'image':
            model = Image
            break
    }

    model.countDocuments(select || {}, function (err, count) {
        cb(err ? -1 : count)
    })
}

function countLinks(cb) {
    Collection.aggregate([
        { $match: {} },
        { $group: { _id: null, total: { $sum: { $size: "$links" } } } }
    ], function (err, data) {
        cb(err ? -1 : data[0].total)
    })
}

module.exports = function(app) {
    if (!config.exposeMetrics) return

    app.use('/api/metrics', router);
    router.use(morgan);

    initPromClient()

    /**
     * @swagger
     * /metrics:
     *    get:
     *      summary: Expose Prometheus metrics
     *      tags:
     *        - misc
     *      produces:
     *        - text/plain
     *      responses:
     *          200:
     *            description: Prometheus metrics in the default format
     */
    router.get('/', function(req, res) {
        return prom.register.metrics().then(function (data) {
            res.set('content-type', 'text/plain')
            return res.status(200).send(data)
        })
    });
};