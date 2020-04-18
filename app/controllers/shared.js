var express = require('express')
  , router = express.Router()
  , log = require('./../../config/middlewares/log')()
  , _ = require('underscore')
  , mongoose = require('mongoose')
  , Collection = mongoose.model('Collection');

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

    Collection.findOne({_id : _id, shared: true}, {__v : false, created: false, modified: false}, function (err, obj) {
      if (err) return res.makeError(500, err.message, err);
      res.send(obj);
    });
  });
};


