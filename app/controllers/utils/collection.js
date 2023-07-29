const mongoose = require('mongoose'),
    Collection = mongoose.model('Collection'),
    escapeRegExp = require('../../utils/string').escapeRegExp,
    _ = require('underscore')

function fetchCollections(user) {
    return Collection.find({ owner: user._id }, '_id name shared')
        .then(result => ({ status: 200, data: result }))
        .catch(err => ({ status: 500, error: err }))
}

function addLink(link, collectionId, user) {
    // TODO: promise-ception?!
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
                runValidators: true
            })
            .then(obj => {
                if (!obj || !obj.links.length) return reject({ status: 404, error: 'Collection not found or unauthorized.' })
                resolve({ status: 201, data: obj.links[0] })
            })
            .catch(err => reject({ status: 500, error: err }))
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
        ])
            .then(obj => {
                if (!obj) {
                    const err = new Error('Collection aggregation failed')
                    cb(err, null)
                    return reject(err)
                }
                let links = obj.length ? obj[0].links : []
                links = links.map(link => ({ ...link, description: link.description || '' }))
                cb(null, links)
                return resolve(links)
            })
            .catch(err => {
                cb(err, null)
                reject(err)
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
        ])
            .then(obj => {
                if (!obj || !obj.length) {
                    const err = new Error('failed to count links')
                    reject(err)
                    return cb(err)
                }
                resolve(obj[0].totalLinks)
                return cb(err, obj[0].totalLinks)
            })
            .catch(err => {
                reject(err)
                return cb(err)
            })
    })
}

module.exports = {
    fetchCollections: fetchCollections,
    addLink: addLink,
    fetchLinks: fetchLinks,
    countLinks: countLinks
}