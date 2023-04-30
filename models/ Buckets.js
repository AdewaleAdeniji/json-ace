const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bucketSchema = new Schema({
    userID: {
        type: String,
        default: ''
    },
    bucketName: String,
    bucketId: String,
    status: {
        type: Boolean,
        default: true,
    },
    keys: {
        type: Object,
        default: {
            public: '',
            secret: ''
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
})
module.exports = mongoose.model("buckets", bucketSchema);
