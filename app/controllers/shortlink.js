var express = require('express')
  , router = express.Router()
  , mongoose = require('mongoose')
  , Shortlink = mongoose.model('Shortlink')
  , utils = require('../../utils')
  , log = require('./../../config/middlewares/log')()
  , _ = require('underscore');

module.exports = function (app, passport) {
  app.use('/api/shortlink', router);
  app.use('/s', router);
};

router.use(log);

router.get('/:id', function (req, res, next) {
  var asJson = req.query.json;

  Shortlink.findOne({_id : req.params.id}, {__v : 0}, function (err, obj) {
    if (err || !obj) return res.makeError(404, "Not found.");
    if (!asJson && obj.url) res.redirect(obj.url);
    else res.send(_.omit(obj.toObject(), '__v', 'id'));
  });
});

router.post('/', function (req, res, next) {
  if (!req.body.url) return res.makeError(400, 'Malformed request: You need to pass a url attribute.')

  var shortlink = new Shortlink({
    url: req.body.url,
    _id: utils.generateUUID()
  });
  shortlink.save(function (err, obj) {
    if (err) return res.makeError(500, 'Unable to save shortlink to database.', err);
    res.status(201).send(_.omit(obj.toObject(), '__v', 'id'));
  });
});
