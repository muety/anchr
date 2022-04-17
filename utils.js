const config = require('./config/config'),
    mime = require('mime-types')

const utils = {
    imgUrl: function (id) {
        return `${config.publicImageUrl}/${id}`
    },
    shortlinkUrl: function (id) {
        return `${config.publicShortlinkUrl}/${id}`
    },
    generateUUID: function (maxLen) {
        const len = maxLen || 5
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let out = ''
        for (let i = 0, clen = chars.length; i < len; i++) {
            out += chars.substr(0 | Math.random() * clen, 1)
        }
        return out
    },
    isURL: function (url) {
        return !!url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/)
    },
    guessMimeType(extOrFilename) {
        return mime.lookup(extOrFilename)
    }
}

module.exports = utils