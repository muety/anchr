var swaggerJsdoc = require('swagger-jsdoc')
    , config = require('./config')
    , package = require('../package.json');

var apiPath = new URL(config.publicUrl)
var baseUrl = config.publicUrl.substring(0, config.publicUrl.lastIndexOf(apiPath) + 1)

var options = {
    swaggerDefinition: {
        version: '2.0',
        info: {
            title: 'Anchr.io API',
            version: package.version,
            description: package.description,
        },
        host: baseUrl,
        basePath: apiPath
    },
    apis: ['./app/controllers/*.js', './config/swagger/*.yml'],
};

module.exports = {
    specs: swaggerJsdoc(options)
}
