var helmet = require('helmet')

module.exports = function () {
    var helmetHandler = helmet({
        hsts: false,
        expectCt: false,
        hidePoweredBy: false,
        contentSecurityPolicy: {
            directives: Object.assign(
                helmet.contentSecurityPolicy.getDefaultDirectives(),
                {
                    'script-src': ["'self'", "'unsafe-inline'"]
                }
            )
        }
    });

    return function (req, res, next) {
        helmetHandler(req, res, function () {
            // additional headers can be set header, for instance 'Report-To'
            next();
        });
    };
};
