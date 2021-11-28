var mongoose = require('mongoose'),
    Collection = mongoose.model('Collection');

function countLinks(id, cb) {
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
        if (err || !obj || !obj.length) return cb(err || 'failed to count links');
        cb(err, obj[0].totalLinks)
    })
}

module.exports = {
    countLinks: countLinks
}