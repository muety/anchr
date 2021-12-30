var express = require("express"),
  router = express.Router(),
  morgan = require("./../../config/middlewares/morgan")(),
  _ = require("underscore"),
  mongoose = require("mongoose"),
  Collection = mongoose.model("Collection"),
  fetchLinks = require("./utils").fetchLinks,
  countLinks = require("./utils").countLinks;

module.exports = function (app) {
  app.use("/api/shared", router);

  router.use(morgan);

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
   *            description: Details about the requested collection, excluding links
   *            schema:
   *              $ref: '#/definitions/CollectionDetails'
   */
  router.get("/:id", function (req, res) {
    var _id = req.params.id;
    if (!_id) return res.makeError(404, "Not found. Please give an id.", err);

    Collection.findOne({ _id: _id, shared: 1 }, { links: 0 }, function(err, obj) {
      if (err) return res.makeError(500, err.message, err);
      if (!obj) return res.makeError(404, "Collection not found or unauthorized.");
      res.send(obj.toObject());
    });
  });

  /**
   * @swagger
   * /shared/{id}/links:
   *    get:
   *      summary: Get links contained in a collection
   *      tags:
   *        - collection
   *      security:
   *        - ApiKeyAuth: []
   *      parameters:
   *        - $ref: '#/parameters/collectionId'
   *        - $ref: '#/parameters/page'
   *        - $ref: '#/parameters/pageSize'
   *      produces:
   *        - application/json
   *      responses:
   *          200:
   *            description: List of links in the collection
   *            schema:
   *              $ref: '#/definitions/LinkList'
   */
  router.get("/:id/links", function (req, res) {
    var _id = req.params.id;
    if (!_id) return res.makeError(404, "Not found. Please give an id.");

    var page = Math.max(req.query.page, 1);
    var pageSize = Math.max(req.query.pageSize, 0) || DEFAULT_PAGE_SIZE;

    Promise.allSettled([
      fetchLinks({ _id: _id, shared: true }, req.query.q, pageSize, page),
      countLinks(_id, req.query.q),
    ]).then(function (results) {
      var r1 = results[0];
      var r2 = results[1];

      if (r1.status === "rejected") return res.makeError(500, r1.reason.message, r1.reason);
      if (!r1.value) return res.makeError(404, "Collection not found or unauthorized.");

      var links = r1.value;
      if (r2.status === "fulfilled") {
        res.set("Link", "<?pageSize=" + pageSize + "&page=" + Math.ceil(r2.value / pageSize) + '>; rel="last"');
      }
      res.send(links);
    }).catch(function(e) {
        return res.makeError(500, e);
    });
  });
};