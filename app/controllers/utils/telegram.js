var axios = require('axios'),
    config = require('../../../config/config'),
    mongoose = require("mongoose"),
    User = mongoose.model("User");

function doRequest(method, payload) {
    var token = config.telegram.botToken;
    var url = 'https://api.telegram.org/bot' + token + '/' + method;
    return axios.post(url, payload)
        .then(function (response) {
            if (!response.data.ok) throw response.data.description;
            return response;
        });
}

function resolveUser(telegramUser) {
    return new Promise(function (resolve, reject) {
        User.findOne({ 'telegramUserId': telegramUser.id.toString() }, function (err, user) {
            if (err) return reject(err);
            if (!user) return reject('User not found.')
            resolve(user);
        });
    });

}

module.exports = {
    doRequest: doRequest,
    resolveUser: resolveUser
};