const { Schema } = require("mongoose");
const { ObjectID } = require('mongodb');

const User = new Schema({
    _id: ObjectID,
    time: Date,
    user: String,
    book_id: ObjectID
})

module.exports = User;