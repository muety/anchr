var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  utils = require('../../utils');

var ShortlinkSchema = new Schema({
  url: String,
  _id: String
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

ShortlinkSchema.virtual('href').get(function () {
  return utils.shortlinkUrl(this._id);
});

mongoose.model('Shortlink', ShortlinkSchema);

