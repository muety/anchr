const mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    escapeRegExp = require('../../utils/string').escapeRegExp,
    _ = require('underscore')

function fetchCollections(user) {
    return new Promise((resolve, reject) => {
        Collection.find({ owner: user._id }, '_id name shared', (err, result) => {
            if (err) return reject({ status: 500, error: err })
            resolve({ status: 200, data: result })
        })
    })
}

function addLink(link, collectionId, user) {
    return new Promise((resolve, reject) => {
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
                returnDocument: 'after',
                lean: true,
                projection: {
                    links: { $elemMatch: { date: link.date } },
                },
            },
            (err, obj) => {
                if (err) return reject({ status: 500, error: err })
                if (!obj || !obj.links.length) return reject({ status: 404, error: 'Collection not found or unauthorized.' })
                resolve({ status: 201, data: obj.links[0] })
            }
        )
    })
}

function fetchLinks(filter, q, pageSize, page, cb) {
    if (!cb) cb = function () { }

    const skip = (page - 1) * pageSize
    const regex = q ? new RegExp(`.*${escapeRegExp(q)}.*`, 'i') : null
    const filters = _.clone(filter)

    // https://coderedirect.com/questions/302814/regex-as-filter-in-projection

    const projection = {
        links: {
            $slice: ['$links', skip, pageSize]
        },
        _id: 0
    }

    if (q) {
        filters.$or = [
            { 'links.description': regex },
            { 'links.url': regex }
        ]
    }


    return new Promise((resolve, reject) => {
        Collection.aggregate([
            { $unwind: '$links' },
            { $sort: { 'links.date': -1 } },
            { $match: filters },
            { $group: { _id: null, links: { $push: '$links' } } },
            { $project: projection },
        ], (err, obj) => {
            if (err || !obj) {
                cb(err, null)
                return reject(err)
            }
            const links = obj.length ? obj[0].links : []
            cb(err, links)
            return resolve(links)
        })
    })
}

function countLinks(id, q, cb) {
    if (!cb) cb = function () { }

    const regex = new RegExp(`.*${q}.*`, 'i')
    const filters = { _id: id }

    if (q) {
        filters.$or = [
            { 'links.description': regex },
            { 'links.url': regex }
        ]
    }

    return new Promise((resolve, reject) => {
        Collection.aggregate([
            { $unwind: '$links' },
            { $match: filters },
            { $group: { _id: null, links: { $push: '$links' } } },
            { $project: { totalLinks: { $size: '$links' } } }
        ], (err, obj) => {
            if (err || !obj || !obj.length) {
                const errMessage = err || 'failed to count links'
                reject(errMessage)
                return cb(errMessage)
            }
            resolve(obj[0].totalLinks)
            return cb(err, obj[0].totalLinks)
        })
    })
}

module.exports = {
    fetchCollections: fetchCollections,
    addLink: addLink,
    fetchLinks: fetchLinks,
    countLinks: countLinks
}