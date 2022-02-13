const _ = require('underscore'),
    config = require('../../../config/config'),
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
                shortlink.save((err, obj) => {
                    if (err) return reject({ status: 500, error: 'Unable to save shortlink to database.', err })
                    resolve({ status: 201, data: _.omit(obj.toObject(), '__v', 'id', 'createdBy', 'created') })
                })
            })
            .catch(err => {
                return reject({ status: 500, error: `Something went wrong.${err}` })
            })
    })
}

module.exports = {
    addShortlink: addShortlink
}