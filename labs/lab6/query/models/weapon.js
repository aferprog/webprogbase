const { Schema } = require("mongoose");
const { ObjectID } = require('mongodb');

const Book = new Schema({
    _id: ObjectID, 
    name: String, // title
    speed: Number,// pages
    damage: Number, // author
    author: String // user
})

module.exports = Book;