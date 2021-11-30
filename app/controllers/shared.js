var express = require("express"),
  router = express.Router(),
  log = require("./../../config/middlewares/log")(),
  _ = require("underscore"),
  mongoose = require("mongoose"),
  Collection = mongoose.model("Collection"),
  loadCollection = require("./utils").loadCollection,
  countLinks = require("./utils").countLinks;

module.exports = function (app) {
  app.use("/api/shared", router);

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
   *            description: Details about the requested collection, excluding links
   *            schema:
   *              $ref: '#/definitions/CollectionDetails'
   */
  router.get("/:id", function (req, res) {
    var _id = req.params.id;
    if (!_id) return res.makeError(404, "Not found. Please give an id.", err);

    loadCollection({ _id: _id, shared: true }, true)
      .then(function (result) {
        if (!result)
          return res.makeError(404, "Collection not found or unauthorized.");
        res.send(result.toObject());
      })
      .catch(function (err) {
        res.makeError(500, r1.reason.message, r1.reason);
      });
  });
};

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
    loadCollection({ _id: _id, shared: true }, false, pageSize, page),
    countLinks(_id),
  ]).then(function (results) {
    var r1 = results[0];
    var r2 = results[1];

    if (r1.status === "rejected") return res.makeError(500, r1.reason.message, r1.reason);
    if (!r1.value) return res.makeError(404, "Collection not found or unauthorized.");

    var obj = r1.value.toObject();
    if (r2.status === "fulfilled") {
      res.set("Link", "<?pageSize=" + pageSize + "&page=" + Math.ceil(r2.value / pageSize) + '>; rel="last"');
    }
    res.send(obj.links);
  });
});
