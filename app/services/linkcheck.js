const config = require('../../config/config'),
    logger = require('../../config/log')(),
    cron = require('node-cron'),
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
        await Promise.all(this.checkers.map(c => c.initialize()))
        
        cron.schedule(config.linkcheckUpdateCron, () => {
            this.checkers.forEach(c => c.updateData())
        })
    }

    // returns true (malicious) or false (safe) for each url
    async check(urls) {
        const results = _.zip(...(await Promise.all(this.checkers.map(c => c.checkBulk(urls)))))
        return results.map(r => _.some(r))
    }
}

module.exports = LinkCheckerService