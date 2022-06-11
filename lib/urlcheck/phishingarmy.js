const AbstractAbpFilterChecker = require('./abp_filter_checker')

const LIST_URL = 'https://phishing.army/download/phishing_army_blocklist.txt'
const LOCAL_FILE_RELATIVE_PATH = 'filters_phishingarmy.txt'

class PhishingArmyChecker extends AbstractAbpFilterChecker {
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
}

module.exports = PhishingArmyChecker