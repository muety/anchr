const fs = require('fs'),
    { fileTypeFromFile } = require('file-type'),
    logger = require('./../../config/log')()

module.exports = function (allowedTypes) {
    return function (req, res, next) {
        if (req.file) {
            fileTypeFromFile(req.file.path).then((result) => {
                const ok = result && allowedTypes.some((t) => result.mime.match(t))
                if (!ok) {
                    const path = req.file.path
                    fs.unlink(path, (err) => {
                        if (err) logger.default(`[WARN] Failed to unlink file ${path}`)
                        res.status(415).send({ error: 'Type not supported.' })
                    })
                } else next()
            })
        } else next()
    }
}
