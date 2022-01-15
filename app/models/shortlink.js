const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    utils = require('../../utils')

const ShortlinkSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    _id: String,
    created : Date,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'UserSchema'
    }
}, {
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    },
    usePushEach: true
})

ShortlinkSchema.virtual('href').get(function () {
    return utils.shortlinkUrl(this._id)
})

mongoose.model('Shortlink', ShortlinkSchema)