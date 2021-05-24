const { Schema } = require("mongoose");
const { ObjectID } = require('mongodb');

const Book = new Schema({
    _id: ObjectID,
    title: String,
    pages: Number,
    author: String,
    user: String
})

module.exports = Book;