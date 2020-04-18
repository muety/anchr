var swaggerJsdoc = require('swagger-jsdoc')
    , config = require('./config')
    , package = require('../package.json');

// Swagger 2.0 specification: https://swagger.io/docs/specification/2-0/basic-structure/

var apiPath = new URL(config.publicUrl)
var baseUrl = config.publicUrl.substring(0, config.publicUrl.lastIndexOf(apiPath) + 1)

var options = {
    definition: {
        info: {
            title: 'Anchr.io API',
            version: package.version,
            description: package.description,
        },
        host: baseUrl,
        basePath: apiPath
    },
    apis: ['./config/swagger/*.yml', './app/controllers/*.js'],
};

module.exports = {
    specs: swaggerJsdoc(options)
}
