class URLChecker {
    constructor(opts) {
        this.opts = opts || {}
        this.opts.dataDir = this.opts.dataDir || '/tmp'
    }

    async initialize() {
    }

    // eslint-disable-next-line
    async checkBulk(urls) {
        throw new Error('not implemented')
    }

    async updateData() {
        throw new Error('not implemented')
    }
}

module.exports = URLChecker