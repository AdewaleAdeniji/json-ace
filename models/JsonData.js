const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jsonDataSchema = new Schema({
    jsonID: String,
    jsonData: Object,
    jsonKey: String,
    userID: {
        type: String,
        default: ''
    },
    bucket: {
        type: String,
        default: 'default',
    },
    tracks: {
        type: Array,
        default: [],
    },
    status: {
        type: Boolean,
        default: true,
    },
    public: {
        type: Boolean,
        default: true,
    },
    version: {
        default: 1,
        type: Number,
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
module.exports = mongoose.model("jsonData", jsonDataSchema);
