const mongoose = require('mongoose'),
    Schema = mongoose.Schema

const CollectionSchema = new Schema({
    _id: String,
    name: {
        type: String,
        required: true,
    },
    created: Date,
    modified: Date,
    links: [{
        url: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        hits: Number,
        date: Date,
    }],
    shared: Boolean,
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
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

mongoose.model('Collection', CollectionSchema)