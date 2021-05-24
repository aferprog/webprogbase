const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("User" , User);

async function addUser(user)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => model.insertMany(new model(user))).catch((error)=> {res.status(500); return;});    
}

module.exports = {
    async authCRUD(message) {
        await addUser(message);
    }
}