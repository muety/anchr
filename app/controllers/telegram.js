var express = require("express"),
    router = express.Router(),
    _ = require("underscore"),
    config = require("../../config/config"),
    utils = require("../../utils"),
    morgan = require("./../../config/middlewares/morgan")(),
    logger = require('./../../config/log')(),
    auth = require("./../../config/middlewares/auth"),
    User = mongoose.model("User"),
    tgutils = require('./utils/telegram'),
    addShortlink = require('./utils/shortlink').addShortlink;

var otps = {};

var CMD_START = 'CMD_START',
    CMD_WHOAMI = 'CMD_WHOAMI',
    CMD_SHORTEN = 'CMD_SHORTEN',
    CMD_HELP = 'CMD_HELP';

var commandMatchers = {
    [CMD_START]: function (m) {
        var args = m.text.match(/\/start\s(\d+)/);
        return args ? args.slice(1) : null;
    },
    [CMD_WHOAMI]: function (m) {
        var args = m.text.match(/\/whoami/);
        return args ? args.slice(1) : null;
    },
    [CMD_SHORTEN]: function (m) {
        var args = m.text.match(/\/shorten\s(.+)$/);
        return args ? args.slice(1) : null;
    },
    [CMD_HELP]: function (m) {
        return []  // fallback
    }
};

function unauthenticatedHandler(rawMessage) {
    return function (err) {
        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'You do not seem to be authenticated, yet.' });
    }
}

var commandProcessors = {
    [CMD_START]: function (args, rawMessage) {
        var otp = args[0];
        if (!otps[otp]) return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'Sorry, the code you just entered is invalid.' });

        return User.updateOne({ _id: otps[otp]._id }, { telegramChatId: rawMessage.chat.id })
            .then(function () {
                delete otps[otp];
                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'Successfully authenticated!' });
            });
    },
    [CMD_WHOAMI]: function (args, rawMessage) {
        return tgutils.resolveUser(rawMessage.from.id)
            .then(function (user) {
                return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'You are ' + user.getEmail() });
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_SHORTEN]: function (args, rawMessage) {
        if (!utils.isURL(args[0])) {
            return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'Not a valid URL.' });
        }
        return tgutils.resolveUser(rawMessage.from.id)
            .then(function (user) {
                addShortlink(args[0], user)
                    .then(function ({ data }) {
                        var link = config.publicShortlinkUrl + '/' + data._id;
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'Here is your shortlink: ' + link, disable_web_page_preview: true });
                    })
                    .catch(function () {
                        return tgutils.doRequest('sendMessage', { chat_id: rawMessage.chat.id, text: 'Failed to shorten link, sorry.' });
                    })
            })
            .catch(unauthenticatedHandler(rawMessage));
    },
    [CMD_HELP]: function (args, rawMessage) {
        return tgutils.doRequest('sendMessage', {
            chat_id: rawMessage.chat.id,
            text: 'Welcome! To get started, browse to https://anchr.io, go to Settings and get your token. Then, type `/start <YOUR TOKEN>` to authenticate.',
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

        var message = req.body.message;
        var parseResult = parseCommand(message);
        var command = parseResult[0];
        var args = parseResult[1];

        commandProcessors[command](args, message)
            .catch(function (e) {
                logger.error('Failed to process Telegram command "' + command + ' - ', e);
            })

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
        res.setHeader('Content-Type', 'text/plain')
        res.send(otp);
    });
};