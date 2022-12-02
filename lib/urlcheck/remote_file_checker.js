const fs = require('fs'),
    path = require('path'),
    axios = require('axios'),
    URLChecker = require('./checker')

class RemoteFileChecker extends URLChecker {
    constructor(opts) {
        super(opts)
        this.fileContent = null
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
            await this.readFile()
        } catch (e) {
            await this.updateData()
        }
    }

    async updateData() {
        await this.downloadData()
        await this.readFile()
    }

    async downloadData() {
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

    async readFile() {
        this.parsedFilters = {}
        await new Promise((resolve, reject) => {
            fs.readFile(this.dataFile, 'utf-8', (err, content) => {
                if (err) return reject(err)
                this.fileContent = content
                resolve()
            })
        })
    }
}

module.exports = RemoteFileChecker