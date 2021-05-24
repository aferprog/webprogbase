const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const Vote = require("../models/vote");

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("votes", Vote);

async function addVote(vote)
{
    
    return mongoose.connect(dbUrl, connectOptions).then(() => model.insertMany(new model(vote))).catch((error) => { res.status(500); return; });
}

async function deleteVote(vote)
{
    return mongoose.connect(dbUrl, connectOptions).then(() => model.find({})).then(() => { return model.remove({ _id: vote._id }) }).catch((error) => { return 500 });
}

module.exports = {
    async voteCRUD(message) {
        switch (message.type) {
            case 'add':
                delete message.type;
                await addVote(message);
                break;
            case 'delete':
                delete message.type;
                await deleteVote(message);
                break;
            default:
                console.log("Error with weapon messages");
                break;
        }
    }
}