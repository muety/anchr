const AbstractAbpFilterChecker = require('./abp_filter_checker')

const LIST_URL = 'https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/badware.txt'
const LOCAL_FILE_RELATIVE_PATH = 'filters_badware.txt'

class UBlockBadwareChecker extends AbstractAbpFilterChecker {
    async updateData() {
        console.log('Updating UBlockBadwareChecker')
        return super.updateData()
    }

    getDataFileName() {
        return LOCAL_FILE_RELATIVE_PATH
    }

    getDataUrl() {
        return LIST_URL
    }
}

module.exports = UBlockBadwareChecker