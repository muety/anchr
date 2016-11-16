var express = require('express')
  , router = express.Router()
  , config = require('../../config/config')
  , utils = require('../../utils')
  , log = require('./../../config/middlewares/log')()
  , _ = require('underscore')
  , jwtAuth = require('./../../config/middlewares/jwtauth')
  , mongoose = require('mongoose')
  , Collection = mongoose.model('Collection');

module.exports = function (app, passport) {
  app.use('/api/shared', router);

  router.use(log);

  router.get('/:id', function (req, res) {
    var _id = req.params.id;
    if (!_id) return res.makeError(404, 'Not found. Please give an id.');

    Collection.findOne({_id : _id, shared: true}, {__v : 0}, function (err, obj) {
      if (err) return res.makeError(500, err.message, err);
      res.send(obj);
    });
  });

  router.post('/:id', jwtAuth(passport), function (req, res) {
    var _id = req.params.id;
    if (!_id) return res.makeError(404, 'Not found. Please give an id.');

    Collection.update({_id : _id, owner: req.user._id}, {shared : 1}, function (err, num) {
      if (err) return res.makeError(500, err.message, err);
      if (!num || !num.nModified) return res.makeError(404, 'Collection not found or unauthorized.');
      res.status(200).end();
    });
  });
};


