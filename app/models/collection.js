var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  utils = require('../../utils');

var CollectionSchema = new Schema({
  _id: String,
  name: String,
  created : Date,
  modified : Date,
  links: [{
    url: String,
    description: String,
    date : Date,
  }],
  shared : Boolean,
  owner: {
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

mongoose.model('Collection', CollectionSchema);

