const _ = require('underscore'),
    fs = require('fs')

const FILE_UPLOAD_FIELD = 'uploadFile'

module.exports = function (allowedTypes) {
    function matchType(val) {
        for (let i = 0; i < allowedTypes.length; i++) {
            if (val.match(allowedTypes[i])) return true
        }
        return false
    }

    return function (req, res, next) {
        if (req.files && Object.keys(req.files).length) {
            _.each(req.files, (val) => {
                if (!matchType(val.type)) {
                    const path = req.files[FILE_UPLOAD_FIELD].path
                    fs.unlink(path)
                    res.status(415).send({ error: 'Type not supported.' })
                }
                else next()
            })
        }
        else next()
    }
}