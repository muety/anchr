var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  utils = require('../../utils');

var CollectionSchema = new Schema({
  _id: String,
  name: String,
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
  }
});

mongoose.model('Collection', CollectionSchema);

