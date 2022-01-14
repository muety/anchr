var fs = require('fs'),
    path = require('path'),
    express = require("express"),
    router = express.Router(),
    _ = require("underscore"),
    config = require("../../config/config"),
    utils = require("../../utils"),
    morgan = require("./../../config/middlewares/morgan")(),
    logger = require('./../../config/log')(),
    auth = require("./../../config/middlewares/auth"),
    mongoose = require("mongoose"),
    User = mongoose.model("User"),
    Image = mongoose.model('Image'),
    tgutils = require('./utils/telegram'),
    addLink = require('./utils/collection').addLink,
    fetchCollections = require('./utils/collection').fetchCollections,
    addShortlink = require('./utils/shortlink').addShortlink;

var otps = {};
var pendingLinks = {};  // by user

var CMD_START = 'CMD_START',
    CMD_LOGOUT = 'CMD_LOGOUT',
    CMD_WHOAMI = 'CMD_WHOAMI',
    CMD_SHORTEN = 'CMD_SHORTEN',
    CMD_ADD_LINK = 'CMD_ADD_LINK',
    CMD_CHOOSE_COLLECTION = 'CMD_CHOOSE_COLLECTION',
    CMD_UPLOAD_PHOTO = 'CMD_UPLOAD_PHOTO',
    CMD_HELP = 'CMD_HELP';

var commandMatchers = {
    [CMD_START]: function (m) {
        var args = m.text.match(/^\/start\s(\d+)$/);
        return args ? args.slice(1) : null;
    },
    [CMD_LOGOUT]: function (m) {
        var args = m.text.match(/^\/logout$/);
        return args ? args.slice(1) : null;
    },
    [CMD_WHOAMI]: function (m) {
        var args = m.text.match(/^\/whoami$/);
        return args ? args.slice(1) : null;
    },
    [CMD_SHORTEN]: function (m) {
        var args = m.text.match(/^\/shorten\s(.+)$/);
        return args ? args.slice(1) : null;
    },
    [CMD_ADD_LINK]: function (m) {
        // "/add https://anchr.io Anchr" or
        // "/add https://anchr.io" or
        // "https://anchr.io Anchr" or
        // "https://anchr.io" or
        // "lorem ipsum https://anchr.io Anchr"
        var args = m.text.match(/(?:^\/add\s)?(https?:\/\/[^\s]+)(?:\s(.+))?/);
        return args && utils.isURL(args[0]) ? args.slice(1) : null
    },
    [CMD_CHOOSE_COLLECTION]: function (m) {
        var args = m.text.match(/^(\d+)$/);
        return args ? args.slice(1) : null;
    },
    [CMD_UPLOAD_PHOTO]: function (m) {
        return m.photo ? [] : null;
    },
    [CMD_HELP]: function (m) {
        var args = m.text.match(/^\/(?:start|help)$/);
        return args ? args.slice(1) : null;
    }
};

function unauthenticatedHandler(rawMessage) {
    return function (err) {
        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '🤔 You do not seem to be authenticated, yet.' });
    }
}

var commandProcessors = {
    [CMD_START]: function (args, rawMessage) {
        var otp = args[0];
        if (!otps[otp]) return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Sorry, the code you just entered is invalid.' });

        return User.updateOne({ _id: otps[otp]._id }, { telegramUserId: rawMessage.chat.id.toString() })
            .then(function () {
                delete otps[otp];
                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '✅ Successfully authenticated!' });
            });
    },
    [CMD_WHOAMI]: function (args, rawMessage) {
        return tgutils.resolveUser(rawMessage.from)
            .then(function (user) {
                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '👤 You are ' + user.getEmail() });
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_LOGOUT]: function (args, rawMessage) {
        return tgutils.resolveUser(rawMessage.from)
            .then(function (user) {
                return User.updateOne({ _id: user._id }, { $unset: { telegramUserId: '' } });
            })
            .then(function () {
                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '👋 Logged out successfully.' });
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_SHORTEN]: function (args, rawMessage) {
        if (!utils.isURL(args[0])) {
            return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Not a valid URL.' });
        }
        return tgutils.resolveUser(rawMessage.from)
            .then(function (user) {
                addShortlink(args[0], user)
                    .then(function ({ data }) {
                        var link = config.publicShortlinkUrl + '/' + data._id;
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '✅ Successfully added shortlink: ' + link, disable_web_page_preview: true });
                    })
                    .catch(function () {
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Failed to shorten link, sorry.' });
                    })
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_ADD_LINK]: function (args, rawMessage) {
        if (!utils.isURL(args[0])) {
            return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Not a valid URL.' });
        }
        return tgutils.resolveUser(rawMessage.from)
            .then(function (user) {
                pendingLinks[user._id] = {
                    url: args[0],
                    description: args.length > 1 ? args[1] : '',
                    date: Date.now()
                };

                fetchCollections(user)
                    .then(function ({ data }) {
                        // this is not robust to the collections changing while the user does their choice
                        var text = '👇 Choose a collection to save the link to by typing its number:\n\n'
                        text += data
                            .map(function (c, i) {
                                return '**' + (i + 1) + '.** ' + c.name;
                            })
                            .join('\n');
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: text, parse_mode: 'Markdown' });
                    })
                    .catch(function () {
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Failed to add link, sorry.' });
                    })
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_CHOOSE_COLLECTION]: function (args, rawMessage) {
        return tgutils.resolveUser(rawMessage.from)
            .then(function (user) {
                if (!pendingLinks[user._id]) return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '🙅‍♂️ No pending link to add to this collection.' });

                var link = pendingLinks[user._id];
                var index = parseInt(args[0]) - 1;

                fetchCollections(user)
                    .then(function ({ data }) {
                        // this is not robust to the collections changing while the user does their choice
                        if (index < 0 || index >= data.length) return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Invalid collection.' });
                        addLink(link, data[index]._id, user)
                            .then(function () {
                                delete pendingLinks[user._id];
                                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '✅ Link added successfully.' });
                            })
                            .catch(function () {
                                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Failed to add link.' });
                            });
                    })
                    .catch(function () {
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Failed to add link, sorry.' });
                    })
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_UPLOAD_PHOTO]: function (args, rawMessage) {
        return tgutils.resolveUser(rawMessage.from)
            .then(function (user) {
                var fileId = rawMessage.photo[rawMessage.photo.length - 1].file_id;

                tgutils.downloadFile(fileId)
                    .then(function ({ file, stream }) {
                        var targetName = utils.generateUUID() + path.parse(file.file_path).ext;
                        var targetPath = config.uploadDir + targetName;
                        stream.pipe(fs.createWriteStream(targetPath));

                        var image = new Image({
                            _id: targetName,
                            created: Date.now(),
                            source: 'telegram',
                            encrypted: false,
                            type: utils.guessMimeType(targetName),
                            createdBy: user._id
                        });

                        image.save(function (err, obj) {
                            if (err) throw err;
                            var link = config.publicImageUrl + '/' + obj._id;
                            return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '✅ Successfully uploaded image: ' + link, disable_web_page_preview: true });
                        });
                    })
                    .catch(function () {
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: '❌ Failed to upload photo, sorry.' });
                    });
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_HELP]: function (args, rawMessage) {
        return tgutils.doRequest('sendMessage', {
            chat_id: rawMessage.chat.id,
            text: '👋 Welcome! To get started, browse to https://anchr.io, go to Settings and get your token. Then, type `/start <YOUR TOKEN>` to authenticate.',
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        })
    },
};

function parseCommand(message) {
    for (var key in commandMatchers) {
        var result = commandMatchers[key](message);
        if (result !== null) return [key, result];
    }
    throw 'failed to parse command';
}

module.exports = function (app, passport) {
    if (!config.telegram.botToken) return;
    if (!config.telegram.urlSecret) logger.default('[WARN] It is highly recommendable to specify a ANCHR_TELEGRAM_URL_SECRET, see https://core.telegram.org/bots/api#setwebhook. This can be any random string.');

    app.use("/api/telegram", router);
    router.use(morgan);

    var updatesPath = "/updates/" + config.telegram.urlSecret;
    logger.default('Listening for Telegram updates at /api/telegram' + updatesPath)

    router.post(updatesPath, function (req, res) {
        if (!req.body) return res.status(400).end();

        try {
            var message = req.body.message;
            message.text = message.text ? message.text.trim() : '';

            var parseResult = parseCommand(message);
            var command = parseResult[0];
            var args = parseResult[1];

            commandProcessors[command](args, message)
                .catch(function (e) {
                    logger.error('Failed to process Telegram command "' + command + ' - ', e);
                })
        } catch (e) {
            tgutils.doRequest('sendMessage', { chat_id: message.chat.id, text: '🤷‍♂️ Sorry, I did not understand you' });
        }

        res.status(204).end();
    });

    router.get("/otp", auth(passport), function (req, res) {
        if (!req.user) return res.makeError(401, 'Unauthorized');
        var otp = _.range(0, 6)
            .map(function () {
                return _.random(0, 9);
            })
            .join('');
        otps[otp] = req.user;
        res.setHeader('Content-Type', 'text/plain');
        res.send(otp);
    });
};