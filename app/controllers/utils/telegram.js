const stream = require('stream'),
    config = require('../../../config/config'),
    mongoose = require('mongoose'),
    User = mongoose.model('User')

function doRequest(method, payload) {
    const token = config.telegram.botToken
    const url = `https://api.telegram.org/bot${token}/${method}`
    return fetch(url, {
        method: 'post',
        body: JSON.stringify(payload),
        headers: { 'content-type': 'application/json' }
    })
        .then((response) => response.json())
        .then((data) => {
            if (!data.ok) throw data.description
            return data
        })
}

function downloadFile(fileId) {
    return doRequest('getFile', { file_id: fileId })
        .then((data) => {
            const file = data.result
            const token = config.telegram.botToken
            const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`
            return fetch(url)
                .then((res) => {
                    return stream.Readable.fromWeb(res.body)
                })
                .then((stream) => {
                    return { file: file, stream: stream }
                })
        })
}

function resolveUser(telegramUser) {
    return User.findOne({ 'telegramUserId': telegramUser.id.toString() })
        .then(user => {
            if (!user) throw new Error('User not found.')
            return user
        })
}

module.exports = {
    doRequest: doRequest,
    resolveUser: resolveUser,
    downloadFile: downloadFile
}