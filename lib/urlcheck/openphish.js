const AbstractAbpFilterChecker = require('./abp_filter_checker')

const LIST_URL = 'https://curben.gitlab.io/malware-filter/phishing-filter.txt'
const LOCAL_FILE_RELATIVE_PATH = 'filters_openphish.txt'

class OpenphishChecker extends AbstractAbpFilterChecker {
    async updateData() {
        console.log('Updating OpenphishChecker')
        return super.updateData()
    }

    getDataFileName() {
        return LOCAL_FILE_RELATIVE_PATH
    }

    getDataUrl() {
        return LIST_URL
    }
}

module.exports = OpenphishChecker