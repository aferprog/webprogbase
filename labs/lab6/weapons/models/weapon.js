const { Schema } = require("mongoose");
const { ObjectID } = require('mongodb');

const Weapon = new Schema({
    _id: ObjectID,
    name: String,//title
    speed: Number,//pages
    author: String,//user
    damage: Number//author
})

module.exports = Weapon;