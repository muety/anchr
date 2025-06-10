const helmet = require('helmet')

module.exports = function () {
    const helmetHandler = helmet({
        hsts: false,
        expectCt: false,
        hidePoweredBy: false,
        contentSecurityPolicy: {
            directives: Object.assign(
                helmet.contentSecurityPolicy.getDefaultDirectives(),
                {
                    'script-src': ['\'self\'', '\'unsafe-inline\''],
                    'img-src': ['\'self\'', 'data:', 'blob:'],
                }
            )
        }
    })

    return function (req, res, next) {
        helmetHandler(req, res, () => {
            // additional headers can be set header, for instance 'Report-To'
            next()
        })
    }
}