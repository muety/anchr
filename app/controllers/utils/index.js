var mongoose = require('mongoose'),
    Collection = mongoose.model('Collection');

function loadCollection(filter, pageSize, page, cb) {
    if (!cb) cb = function() {}
    return new Promise(function(resolve, reject) {
        var skip = (page - 1) * pageSize;

        Collection.findOne(filter, {
            __v: false,
            created: false,
            modified: false,
            links: { $slice: [skip, pageSize] }
        }, function(err, obj) {
            if (err) {
                cb(err, obj);
                return reject(err);
            }
            cb(err, obj);
            return resolve(obj);
        });
    });
};

function countLinks(id, cb) {
    if (!cb) cb = function() {}
    return new Promise(function (resolve, reject) {
        Collection.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $project: {
                    totalLinks: { $size: '$links' }
                }
            }
        ], function (err, obj) {
            if (err || !obj || !obj.length) {
                var errMessage = err || 'failed to count links';
                reject(errMessage);
                return cb(errMessage);
            }
            resolve(obj[0].totalLinks);
            return cb(err, obj[0].totalLinks);
        })
    });
}

module.exports = {
    loadCollection: loadCollection,
    countLinks: countLinks
}