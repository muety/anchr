var express = require('express')
  , router = express.Router()
  , log = require('./../../config/middlewares/log')()
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , Collection = mongoose.model('Collection')
  , countLinks = require('./utils').countLinks;

module.exports = function (app) {
  app.use('/api/shared', router);

  router.use(log);

  /**
   * @swagger
   * /shared/{id}:
   *    get:
   *      summary: Get details about a shared collection including all links
   *      tags:
   *        - collection
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: Details about the requested collection
   *            schema:
   *              $ref: '#/definitions/CollectionDetails'
   */
  router.get('/:id', function (req, res) {
    var _id = req.params.id;
    if (!_id) return res.makeError(404, 'Not found. Please give an id.');

    var page = Math.max(req.query.page, 1);
    var pageSize = Math.max(req.query.pageSize, 0) || DEFAULT_PAGE_SIZE;
    var skip = (page - 1) * pageSize;

    Collection.findOne({
      _id: _id,
      shared: true
    }, {
      __v: false,
      created: false,
      modified: false,
      links: { $slice: [skip, pageSize] }
    }, function (err, obj) {
      if (err) return res.makeError(500, err.message, err);

      obj = obj.toObject();

      countLinks(_id, function (err, count) {
        if (count) {
          res.set('Link', '<?pageSize=' + pageSize + '&page=' + Math.ceil(count / pageSize) + '>; rel="last"');
          obj.size = count;
        }
        res.send(obj);
      })
    });
  });
};


