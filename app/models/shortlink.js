var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  utils = require('../../utils');

var ShortlinkSchema = new Schema({
  url: String,
  _id: String,
  created : Date,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "UserSchema"
  }
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  },
  usePushEach: true
});

ShortlinkSchema.virtual('href').get(function () {
  return utils.shortlinkUrl(this._id);
});

mongoose.model('Shortlink', ShortlinkSchema);

