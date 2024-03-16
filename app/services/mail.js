const nodemailer = require('nodemailer')
    , logger = require('../../config/log')()

module.exports = function (provider, config) {
    let sendFn = function () {
        logger.default('Not sending mail as no SMTP config was provided')
        return Promise.resolve()
    }

    if (provider === 'smtp') {
        if (config && config.host) {
            const mailTransport = nodemailer.createTransport(config)
            mailTransport.sendMail = mailTransport.sendMail.bind(mailTransport)
            sendFn = mailTransport.sendMail
        }
    }

    return {
        send: sendFn
    }
}