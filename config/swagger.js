var swaggerJsdoc = require('swagger-jsdoc')
    , config = require('./config')
    , package = require('../package.json');

// Swagger 2.0 specification: https://swagger.io/docs/specification/2-0/basic-structure/

var url = new URL(config.publicUrl)

var options = {
    definition: {
        info: {
            title: 'Anchr.io API',
            version: package.version,
            description: package.description
        },
        host: url.host,
        basePath: url.pathname,
        consumes: [
            'application/json',
            'multipart/form-data'
        ]
    },
    apis: ['./config/swagger/*.yml', './app/controllers/*.js'],
};

module.exports = {
    specs: swaggerJsdoc(options)
}
