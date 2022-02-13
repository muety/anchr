const config = require('../../config/config'),
    logger = require('../../config/log')(),
    _ = require('underscore')

const BLACKLIST = [
    /.*bit\.ly.*/gi,
    /.*goo\.gl.*/gi,
    /.*confirm.*/gi,
    /.*verif.*/gi,
    /.*account.*/gi,
    /.*secur.*/gi
]

class LinkCheckerService {
    constructor() {
        this.checkers = [
            new (require('../../lib/urlcheck/ublock_badware'))({}),
            new (require('../../lib/urlcheck/phishingarmy'))({}),
            new (require('../../lib/urlcheck/openphish'))({}),
            new (require('../../lib/urlcheck/simple_blacklist'))({}, BLACKLIST),
        ]

        if (config.googleApiKey) {
            this.checkers.push(
                new (require('../../lib/urlcheck/safe_browsing'))({}, config.googleApiKey, 'anchr.io')
            )
        }

        logger.default(`Enabled link safety checking with ${this.checkers.length} checkers`)
    }

    async initialize() {
        this.checkers.forEach(async c => c.initialize())
    }

    // returns true (malicious) or false (safe) for each url
    async check(urls) {
        const results = _.zip(...(await Promise.all(this.checkers.map(c => c.checkBulk(urls)))))
        return results.map(r => _.some(r))
    }
}

module.exports = LinkCheckerService