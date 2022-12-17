const _ = require('underscore'),
    RemoteFileChecker = require('./remote_file_checker')

const LIST_URL = 'https://phishing.army/download/phishing_army_blocklist.txt'
const LOCAL_FILE_RELATIVE_PATH = 'filters_phishingarmy.txt'

class PhishingArmyChecker extends RemoteFileChecker {
    constructor(opts) {
        super(opts)
        this.patterns = []
    }

    async updateData() {
        console.log('Updating PhishingArmyChecker')
        return super.updateData()
    }

    getDataFileName() {
        return LOCAL_FILE_RELATIVE_PATH
    }

    getDataUrl() {
        return LIST_URL
    }

    async checkBulk(urls) {
        return urls.map(url => _.some(this.patterns.map(p => url.includes(p))))
    }

    async readFile() {
        await super.readFile()
        const lines = this.fileContent.split('\n')
        this.patterns = lines
            .slice(lines.findIndex(l => l === '') + 1)
            .filter(l => l.length)
    }
}

module.exports = PhishingArmyChecker