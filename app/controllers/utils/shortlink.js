var _ = require('underscore'),
    config = require('../../../config/config'),
    utils = require('../../../utils'),
    mongoose = require('mongoose'),
    safeBrowseLookup = require('safe-browse-url-lookup'),
    Shortlink = mongoose.model('Shortlink');


var blacklist = [/.*bit\.ly.*/gi, /.*goo\.gl.*/gi, /.*confirm.*/gi, /.*verif.*/gi, /.*account.*/gi, /.*secur.*/gi];

var lookup = config.googleApiKey
    ? safeBrowseLookup({ apiKey: config.googleApiKey, clientId: 'anchr.io' })
    : { checkSingle: function () { return Promise.resolve(false) } }

function addShortlink(url, user) {
    return new Promise(function (resolve, reject) {
        for (var i = 0; i < blacklist.length; i++) {
            if (blacklist[i].test(url)) return reject({ status: 400, error: 'The link you try to reference is not safe!' });
        }

        lookup.checkSingle(url)
            .then(isMalicious => {
                if (isMalicious) return reject({ status: 400, error: 'The link you try to reference is not safe!' });
                var shortlink = new Shortlink({
                    url: url,
                    _id: utils.generateUUID(),
                    created: Date.now(),
                    createdBy: user._id
                });
                shortlink.save(function (err, obj) {
                    if (err) return reject({ status: 500, error: 'Unable to save shortlink to database.', err });
                    resolve({ status: 201, data: _.omit(obj.toObject(), '__v', 'id', 'createdBy', 'created') })
                });
            })
            .catch(err => {
                return reject({ status: 500, error: 'Something went wrong.' + err });
            });
    });
}

module.exports = {
    addShortlink: addShortlink
};