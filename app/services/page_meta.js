const axios = require('axios'),
    htmlparser = require('htmlparser2'),
    cache = require('memory-cache'),
    config = require('../../config/config')

const CACHE_TIMEOUT = 1000 * 60 * 60 * 24

class PageMetaService {
    constructor() {
        if (!PageMetaService._instance) {
            PageMetaService.instance = this
        }
        return PageMetaService._instance
    }

    async fetchTitle(url) {
        function done(title) {
            cache.put(url, title, CACHE_TIMEOUT)
            return title
        }

        const cachedValue = cache.get(url)
        if (cachedValue) return done(cachedValue)
        else if (cache.keys().includes(url)) return done(null)

        cache.put(url, null, CACHE_TIMEOUT) // prevent redirect loops

        return await axios({
            method: 'head',
            url: url,
            headers: { 'Accept': 'text/html' }
        }).then((response) => {
            const contentType = response.headers['content-type']
            const contentLenth = parseInt(response['content-length']) / 1000

            if (!contentType.includes('text/html') && (!contentLenth || contentLenth > config.maxHtmlSizeKb)) {
                return done(null)
            }

            return axios({
                method: 'get',
                url: url,
                headers: { 'Accept': 'text/html' }
            })
        }).then((response) => {
            if (!response) return

            const contentType = response.headers['content-type']
            if (!contentType.startsWith('text/html')) return done(null)

            let title = null

            const handler = new htmlparser.DomHandler((error, dom) => {
                if (error) throw new Error(error)

                const htmlNode = dom.filter((n) => { return n.type === 'tag' && n.name === 'html' })[0]
                const headNode = htmlNode.children.filter((n) => { return n.type === 'tag' && n.name === 'head' })[0]
                const titleNode = headNode.children.filter((n) => { return n.type === 'tag' && n.name === 'title' })[0]

                title = titleNode.children[0].data.trim()
                title = title.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec)).replace(/&.+;/g, '')
            })

            const parser = new htmlparser.Parser(handler)
            parser.parseComplete(response.data)

            return title
        })
    }
}

module.exports = PageMetaService