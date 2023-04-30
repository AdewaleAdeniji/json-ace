const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userID: {
        type: String,
        default: ''
    },
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
    email: String,
    password: String,
    quota: {
        type: Number,
        default: 50000
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
module.exports = mongoose.model("users", userSchema);
