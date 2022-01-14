var mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    escapeRegExp = require('../../utils/string').escapeRegExp,
    _ = require('underscore');

function fetchCollections(user) {
    return new Promise(function(resolve, reject) {
        Collection.find({ owner: user._id }, "_id name shared", function (err, result) {
            if (err) return reject({ status: 500, error: err });
            resolve({ status: 200, data: result });
        });
    })
}

function addLink(link, collectionId, user) {
    return new Promise(function (resolve, reject) {
        Collection.findOneAndUpdate(
            {
                _id: collectionId,
                owner: user._id,
            },
            {
                $push: { links: link },
                modified: new Date(),
            },
            {
                returnDocument: "after",
                lean: true,
                projection: {
                    links: { $elemMatch: { date: link.date } },
                },
            },
            function (err, obj) {
                if (err) return reject({ status: 500, error: err });
                if (!obj || !obj.links.length) return reject({ status: 404, error: "Collection not found or unauthorized." });
                resolve({ status: 201, data: obj.links[0] })
            }
        );
    });
}

function fetchLinks(filter, q, pageSize, page, cb) {
    if (!cb) cb = function () { };

    var skip = (page - 1) * pageSize;
    var regex = q ? new RegExp('.*' + escapeRegExp(q) + '.*', 'i') : null;
    var filters = _.clone(filter);

    // https://coderedirect.com/questions/302814/regex-as-filter-in-projection

    var projection = {
        links: {
            $slice: ['$links', skip, pageSize]
        },
        _id: 0
    };

    if (q) {
        filters.$or = [
            { 'links.description': regex },
            { 'links.url': regex }
        ];
    };


    return new Promise(function (resolve, reject) {
        Collection.aggregate([
            { $unwind: '$links' },
            { $sort: { 'links.date': -1 } },
            { $match: filters },
            { $group: { _id: null, links: { $push: '$links' } } },
            { $project: projection },
        ], function (err, obj) {
            if (err || !obj) {
                cb(err, null);
                return reject(err);
            }
            var links = obj.length ? obj[0].links : []
            cb(err, links);
            return resolve(links);
        })
    });
};

function countLinks(id, q, cb) {
    if (!cb) cb = function () { }

    var regex = new RegExp('.*' + q + '.*', 'i');
    var filters = { _id: id };

    if (q) {
        filters.$or = [
            { 'links.description': regex },
            { 'links.url': regex }
        ];
    };

    return new Promise(function (resolve, reject) {
        Collection.aggregate([
            { $unwind: '$links' },
            { $match: filters },
            { $group: { _id: null, links: { $push: '$links' } } },
            { $project: { totalLinks: { $size: '$links' } } }
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
    fetchCollections: fetchCollections,
    addLink: addLink,
    fetchLinks: fetchLinks,
    countLinks: countLinks
}