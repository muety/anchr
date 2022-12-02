const fs = require('fs'),
    path = require('path'),
    axios = require('axios'),
    abp = require('@brigand/abp-filter-parser'),
    RemoteFileChecker = require('./remote_file_checker')

class AbstractAbpFilterChecker extends RemoteFileChecker {
    constructor(opts) {
        super(opts)
    }

    async checkBulk(urls) {
        // dirty hack to prevent this useless file from being saved at project root (which is not necessarily writable by application user)
        // https://github.com/brigand/abp-filter-parser/blob/b1ce4aa228818d9181860d6d3f6b88a83b877c37/src/abp-filter-parser.js#L541
        process.browser = true
        const results = Promise.resolve(urls.map(url => abp.matches(this.parsedFilters, url, {})))
        delete process.browser
        return results
    }

    async readFile() {
        this.parsedFilters = {}
        await super.readFile()
        abp.parse(this.fileContent, this.parsedFilters)
    }
}

module.exports = AbstractAbpFilterChecker