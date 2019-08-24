var express = require('express'),
    router = express.Router(),
    axios = require('axios'),
    htmlparser = require('htmlparser'),
    cache = require('memory-cache'),
    config = require('../../config/config'),
    log = require('./../../config/middlewares/log')(),
    _ = require('underscore');

var CACHE_TIMEOUT = 1000 * 60 * 60 * 24;

module.exports = function(app) {
    app.use('/api/remote', router);
    router.use(log);

    router.get('/page', function(req, res, next) {
        var url = req.query.url;

        if (!url || !url.length) return res.makeError(400, 'No url given');

        function sendTitle(t) {
            cache.put(url, t, CACHE_TIMEOUT);
            return res.send({ title: t });
        }

        var cachedValue = cache.get(url);
        if (cachedValue) return sendTitle(cachedValue)

        axios({
            method: 'head',
            url: url,
            headers: { 'Accept': 'text/html' }
        }).then(function(response) {
            var contentType = response.headers['content-type'];
            var contentLenth = parseInt(response['content-length']) / 1000;
            if (!contentType.includes('text/html') && (!contentLenth || contentLenth > config.maxHtmlSizeKb)) {
                sendTitle(null);
                return null;
            }
            return axios({
                method: 'get',
                url: url,
                headers: { 'Accept': 'text/html' }
            });
        }).then(function(response) {
            if (!response) return;
            var contentType = response.headers['content-type'];
            if (!contentType.startsWith('text/html')) return sendTitle(null);
            var handler = new htmlparser.DefaultHandler(function (error, dom) {
                if (error) return res.makeError(404, 'Not found');
                var htmlNode = dom.filter(function(n) { return n.type === 'tag' && n.name === 'html' })[0];
                var headNode = htmlNode.children.filter(function(n) { return n.type === 'tag' && n.name === 'head' })[0];
                var titleNode = headNode.children.filter(function(n) { return n.type === 'tag' && n.name === 'title' })[0];
                var title = titleNode.children[0].data.trim();
                title = title.replace(/&#(\d+);/g, function(match, dec) {
                    return String.fromCharCode(dec);
                }).replace(/&.+;/g, '');
                return sendTitle(title);
            });
            var parser = new htmlparser.Parser(handler);
            parser.parseComplete(response.data);
        }).catch(function(err) {
            console.error(err)
            return res.makeError(404, 'Not found');
        });
    });
};