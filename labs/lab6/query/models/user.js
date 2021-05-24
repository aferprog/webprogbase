const { Schema } = require("mongoose");
const { ObjectID } = require('mongodb');

const User = new Schema({
    _id: ObjectID,
    login: String,
    password: String,
    registeredAt: Date
})

module.exports = User;