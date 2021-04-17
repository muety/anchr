var nodemailer = require('nodemailer')
    , axios = require('axios')

module.exports = function (provider, config) {
    var sendFn = function () {
        console.log('Not sending mail as no SMTP config was provided');
        return Promise.resolve();
    }

    if (provider === 'smtp') {
        if (config && config.host) {
            var mailTransport = nodemailer.createTransport(config);
            mailTransport.sendMail = mailTransport.sendMail.bind(mailTransport);
            sendFn = mailTransport.sendMail;
        }
    } else if (provider === 'mailwhale') {
        sendFn = function (mail) {
            return axios.request({
                method: 'post',
                baseURL: config.url,
                url: '/api/mail',
                timeout: 5000,
                auth: {
                    username: config.clientId,
                    password: config.clientSecret,
                },
                data: {
                    to: [ mail.to ],
                    subject: mail.subject,
                    text: mail.text
                }
            })
        };
    }

    return {
        send: sendFn
    }
}