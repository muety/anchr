const _ = require('underscore'),
    URLChecker = require('./checker')

class SimpleBlacklistChecker extends URLChecker {
    constructor(opts, patterns) {
        super(opts)
        this.blacklist = (patterns || []).map(re => new RegExp(re.source, re.flags.replace('g', '')))
    }

    async checkBulk(urls) {
        return urls.map(url => _.some(this.blacklist.map(re => re.test(url))))
    }

    async updateData() {
    }

    async initialize() {
    }
}

module.exports = SimpleBlacklistChecker