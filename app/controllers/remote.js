const express = require('express'),
    router = express.Router(),
    axios = require('axios'),
    htmlparser = require('htmlparser2'),
    cache = require('memory-cache'),
    config = require('../../config/config'),
    morgan = require('../../config/middlewares/morgan')(),
    logger = require('./../../config/log')()

const CACHE_TIMEOUT = 1000 * 60 * 60 * 24

module.exports = function (app) {
    app.use('/api/remote', router)

    router.use(morgan)

    /**
     * @swagger
     * /remote/page:
     *    get:
     *      summary: Get a remote HTML website's title
     *      tags:
     *        - remote
     *      parameters:
     *        - $ref: '#/parameters/remoteUrl'
     *      produces:
     *        - application/json
     *      responses:
     *          200:
     *            description: The target website's title
     *            schema:
     *              type: object
     *              properties:
     *                title:
     *                  type: string
     *                  description: Website title
     */
    router.get('/page', (req, res) => {
        const url = req.query.url

        if (!url || !url.length) return res.makeError(400, 'No url given')

        function sendTitle(t) {
            cache.put(url, t, CACHE_TIMEOUT)
            return res.send({ title: t })
        }

        const cachedValue = cache.get(url)
        if (cachedValue) return sendTitle(cachedValue)
        else if (cache.keys().includes(url)) return sendTitle(null)

        cache.put(url, null, CACHE_TIMEOUT) // prevent redirect loops

        axios({
            method: 'head',
            url: url,
            headers: { 'Accept': 'text/html' }
        }).then((response) => {
            const contentType = response.headers['content-type']
            const contentLenth = parseInt(response['content-length']) / 1000
            if (!contentType.includes('text/html') && (!contentLenth || contentLenth > config.maxHtmlSizeKb)) {
                sendTitle(null)
                return null
            }
            return axios({
                method: 'get',
                url: url,
                headers: { 'Accept': 'text/html' }
            })
        }).then((response) => {
            if (!response) return
            const contentType = response.headers['content-type']
            if (!contentType.startsWith('text/html')) return sendTitle(null)
            const handler = new htmlparser.DomHandler((error, dom) => {
                if (error) return res.makeError(404, 'Not found')
                const htmlNode = dom.filter((n) => { return n.type === 'tag' && n.name === 'html' })[0]
                const headNode = htmlNode.children.filter((n) => { return n.type === 'tag' && n.name === 'head' })[0]
                const titleNode = headNode.children.filter((n) => { return n.type === 'tag' && n.name === 'title' })[0]
                let title = titleNode.children[0].data.trim()
                title = title.replace(/&#(\d+);/g, (match, dec) => {
                    return String.fromCharCode(dec)
                }).replace(/&.+;/g, '')
                return sendTitle(title)
            })
            const parser = new htmlparser.Parser(handler)
            parser.parseComplete(response.data)
        }).catch((err) => {
            logger.error(`Failed to resolve title for URL ${url} - ${err}`)
            return res.makeError(404, 'Not found')
        })
    })
}