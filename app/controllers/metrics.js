const express = require('express'),
    router = express.Router(),
    morgan = require('../../config/middlewares/morgan')(),
    config = require('./../../config/config'),
    mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    User = mongoose.model('User'),
    Image = mongoose.model('Image'),
    Shortlink = mongoose.model('Shortlink'),
    prom = require('prom-client'),
    du = require('du')

const PREFIX = 'anchr_'

function initPromClient() {
    prom.collectDefaultMetrics({
        gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
        prefix: PREFIX,
    })

    const gTotalUsers = new prom.Gauge({
        name: `${PREFIX}users_total`,
        help: 'Total number of registered users',
        labelNames: []
    })

    gTotalUsers.collect = function () {
        return new Promise((resolve) => {
            count('user', null, (count) => {
                gTotalUsers.set(count)
                resolve()
            })
        })
    }

    const gTotalCollections = new prom.Gauge({
        name: `${PREFIX}collections_total`,
        help: 'Total number of link collections',
        labelNames: []
    })

    gTotalCollections.collect = function () {
        return new Promise((resolve) => {
            count('collection', null, (count) => {
                gTotalCollections.set(count)
                resolve()
            })
        })
    }

    const gTotalShortlinks = new prom.Gauge({
        name: `${PREFIX}shortlinks_total`,
        help: 'Total number of shortlinks',
        labelNames: []
    })

    gTotalShortlinks.collect = function () {
        return new Promise((resolve) => {
            count('shortlink', null, (count) => {
                gTotalShortlinks.set(count)
                resolve()
            })
        })
    }

    const gTotalImages = new prom.Gauge({
        name: `${PREFIX}images_total`,
        help: 'Total number of uploaded images',
        labelNames: ['encryption']
    })

    gTotalImages.collect = function () {
        return Promise.all([
            new Promise((resolve) => {
                count('image', { encrypted: false }, (count) => {
                    gTotalImages.set({ encryption: false }, count)
                    resolve()
                })
            }),
            new Promise((resolve) => {
                count('image', { encrypted: true }, (count) => {
                    gTotalImages.set({ encryption: true }, count)
                    resolve()
                })
            })
        ])
    }

    const gTotalLinks = new prom.Gauge({
        name: `${PREFIX}links_total`,
        help: 'Total number of links among all collections',
        labelNames: []
    })

    gTotalLinks.collect = function () {
        return new Promise((resolve) => {
            countLinks((count) => {
                gTotalLinks.set(count)
                resolve()
            })
        })
    }

    const gTotalImageSize = new prom.Gauge({
        name: `${PREFIX}images_size_total_bytes`,
        help: 'Total size of all images stored in the file system',
        labelNames: []
    })

    gTotalImageSize.collect = function () {
        return new Promise((resolve) => {
            return du(config.uploadDir, (err, size) => {
                gTotalImageSize.set(err ? -1 : size)
                resolve()
            })
        })
    }
}

function count(type, select, cb) {
    let model = null

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

    model.countDocuments(select || {}).then(cb).catch(err => cb(-1))
}

function countLinks(cb) {
    Collection.aggregate([
        { $match: {} },
        { $group: { _id: null, total: { $sum: { $size: '$links' } } } }
    ])
        .then(data => cb(data[0].total))
        .catch(err => cb(-1))
}

module.exports = function (app) {
    if (!config.exposeMetrics) return

    app.use('/api/metrics', router)
    router.use(morgan)

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
    router.get('/', (req, res) => {
        return prom.register.metrics().then((data) => {
            res.set('content-type', 'text/plain')
            return res.status(200).send(data)
        })
    })
}