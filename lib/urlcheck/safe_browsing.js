const safeBrowseLookup = require('safe-browse-url-lookup'),
    _ = require('underscore'),
    URLChecker = require('./checker')

const BATCH_SIZE = 10

class SafeBrowsingChecker extends URLChecker {
    constructor(opts, apiKey, clientId) {
        super(opts)
        this.client = safeBrowseLookup({ apiKey, clientId })
    }

    async checkBulk(urls) {
        if (urls.length <= BATCH_SIZE) {
            const resultMap = await this.client.checkMulti(urls)
            return urls.map(url => !!resultMap[url])
        }

        const chunks = _.chunk(urls, BATCH_SIZE)
        const results = new Array(BATCH_SIZE)
        for (let i = 0; i < chunks.length; i++) {
            try {
                results[i] = await await this.checkBulk(chunks[i])
            } catch(e) {
                throw new Error(`failed to perform safe browsing lookup (${e.message})`)
            }
        }
        return _.flatten(results)
    }

    async updateData() {
    }

    async initialize() {
        try {
            await this.client.checkSingle('https://github.com')
        } catch (e) {
            throw new Error('failed to initialize SafeBrowsingChecker, api key wrong, maybe?')
        }
    }
}

module.exports = SafeBrowsingChecker
