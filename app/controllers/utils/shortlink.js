const _ = require('underscore'),
    cron = require('node-cron'),
    config = require('../../../config/config'),
    logger = require('../../../config/log')(),
    utils = require('../../../utils'),
    mongoose = require('mongoose'),
    Shortlink = mongoose.model('Shortlink'),
    LinkCheckerService = require('../../services/linkcheck')

const checker = new LinkCheckerService()
checker.initialize()  // not waiting for promise here

function addShortlink(url, user) {
    return new Promise((resolve, reject) => {
        checker.check([url])
            .then(result => {
                const isMalicious = result[0]
                if (isMalicious) return reject({ status: 400, error: 'The link you try to reference is not safe!' })
                const shortlink = new Shortlink({
                    url: url,
                    _id: utils.generateUUID(),
                    created: Date.now(),
                    createdBy: user._id
                })
                return shortlink.save()
                .then((obj) => {
                    return resolve({ status: 201, data: _.omit(obj.toObject(), '__v', 'id', 'createdBy', 'created') })
                })
                .catch((err) => {
                    return reject({ status: 500, error: 'Unable to save shortlink to database.', err })
                })
            })
            .catch(err => {
                return reject({ status: 500, error: `Something went wrong.${err}` })
            })
    })
}

function scheduleCleanup() {
    async function runCleanup() {
        logger.default('Running shortlink cleanup routine')
        const shortlinks = await Shortlink.find({})
        const checkResults = await checker.check(shortlinks.map(s => s.url))
        const deleteIds = shortlinks
            .filter((s, i) => !!checkResults[i])
            .map(obj => obj._id)
        const { deletedCount } = await Shortlink.deleteMany({ _id: { $in: deleteIds } })
        logger.default(`Deleted ${deletedCount} potentially malicious shortlinks`)
    }

    cron.schedule(config.cron.shortlinkCleanup, runCleanup)
}

module.exports = {
    addShortlink,
    scheduleCleanup,
}