const fs = require('fs'),
    path = require('path'),
    axios = require('axios'),
    abp = require('@brigand/abp-filter-parser'),
    URLChecker = require('./checker')

class AbstractAbpFilterChecker extends URLChecker {
    constructor(opts) {
        super(opts)

        this.dataFile = path.resolve(this.opts.dataDir, this.getDataFileName())
        this.dataUrl = this.getDataUrl()
    }

    getDataFileName() {
        throw new Error('not implemented')
    }

    getDataUrl() {
        throw new Error('not implemented')
    }

    async initialize() {
        try {
            await this._readLocalData()
        } catch (e) {
            await this.updateData()
        }
    }

    async checkBulk(urls) {
        // dirty hack to prevent this useless file from being saved at project root (which is not necessarily writable by application user)
        // https://github.com/brigand/abp-filter-parser/blob/b1ce4aa228818d9181860d6d3f6b88a83b877c37/src/abp-filter-parser.js#L541
        process.browser = true
        const results = Promise.resolve(urls.map(url => abp.matches(this.parsedFilters, url, {})))
        delete process.browser
        return results
    }

    async updateData() {
        await this._downloadData()
        await this._readLocalData()
    }

    async _downloadData() {
        const res = await axios({
            method: 'get',
            url: this.dataUrl,
            responseType: 'stream'
        })
        if (res.status !== 200) throw new Error(`failed to fetch ${this.dataUrl}, got status ${res.status}`)

        await new Promise((resolve) => {
            const outStream = fs.createWriteStream(this.dataFile)
            outStream.on('finish', resolve)
            res.data.pipe(outStream)
        })
    }

    async _readLocalData() {
        this.parsedFilters = {}
        await new Promise((resolve, reject) => {
            fs.readFile(this.dataFile, 'utf-8', (err, content) => {
                if (err) return reject(err)
                abp.parse(content, this.parsedFilters)
                resolve()
            })
        })
    }
}

module.exports = AbstractAbpFilterChecker