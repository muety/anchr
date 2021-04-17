var nodemailer = require('nodemailer')

module.exports = function(smtpConfig) {
    var sendFn = function() {
        console.log('Not sending mail as no SMTP config was provided');
        return Promise.resolve();
    }

    if (smtpConfig && smtpConfig.host) {
        var mailTransport = nodemailer.createTransport(smtpConfig);
        mailTransport.sendMail = mailTransport.sendMail.bind(mailTransport);
        sendFn = mailTransport.sendMail;
    }

    return {
        send: sendFn
    }
}