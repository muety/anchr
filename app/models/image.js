var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  utils = require('../../utils');

var ImageSchema = new Schema({
  _id : String,
  created : Date,
  ip : String,
  encrypted : Boolean,
  type : String,
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
  }
});

ImageSchema.virtual('href').get(function () {
  return utils.imgUrl(this._id);
});

mongoose.model('Image', ImageSchema);

