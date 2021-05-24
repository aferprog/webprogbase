const Vote = require("../models/vote");
const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const amqp = require('amqplib');

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("Vote", Vote);

function checkToken(token) {
    return jwt.verify(token, config.jwtSecret, (err, verifiedJwt) => {
        if (err) {
            return 401;
        }
        else {
            return true;
        }
    });
}

function unpackToken(token) {
    return jwt.decode(token);
}

async function getVote(vote) {
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({"book_id": vote.book_id, "user": vote.user }) }).catch((error) => { return 500 });
}

module.exports = {
    async vote(req, res) {
        if (req.body == null) {
            res.status(400).send("Error");
            return;
        }
        if (req.body.book_id == null) {
            res.status(400).send("Incorrect input");
            return;
        }
        const token = req.body.token;
        if (token == null && token == undefined) {
            res.status(401).send("Unauthorized!");
            return;
        }
        const check = checkToken(token);
        if (check == 401) {
            res.status(401).send("Unauthorized");
            return;
        }
        const user = unpackToken(token);
        const vote = {
            _id: new ObjectID(),
            time: new Date(),
            user: user.login,
            book_id: req.body.book_id
        }
        mongoose.connect(dbUrl, connectOptions).then(() => model.insertMany(new model(vote))).catch((error) => { res.status(500); return; });
        res.status(201);
        res.json(vote);
        vote.type = 'add';
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'votes';
                channel.assertQueue(queue);
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(vote)));
            }).catch(err => console.log('amqp', err));
    },

    async unvote(req, res) {
        if (req.body == null) {
            res.status(400).send("Error");
            return;
        }
        if (req.body.book_id == null) {
            res.status(400).send("Incorrect input");
            return;
        }
        const token = req.body.token;
        if (token == null && token == undefined) {
            res.status(401).send("Unauthorized!");
            return;
        }
        const check = checkToken(token);
        if (check == 401) {
            res.status(401).send("Unauthorized");
            return;
        }
        const user = unpackToken(token);
        const temp = {
            book_id: new ObjectID(req.body.book_id),
            user: user.login
        }
        var vote = await getVote(temp);
        if (vote == 500 || vote.length == 0) {
            res.status(500).send("DB Error");
            return;
        }
        if (vote == null) {
            res.status(400).send("Not found");
            return;
        }
        await mongoose.connect(dbUrl, connectOptions).then(() => model.find({})).then(() => { return model.remove({ _id: vote[0]._id }) }).catch((error) => { return 500 });
        res.status(200).json(vote[0]);
        vote = vote[0];
        const queue_vote = {
            _id: vote._id,
            time: vote.time,
            user: vote.user,
            book_id: vote.book_id,
            type: 'delete'
        }
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'votes';
                channel.assertQueue(queue);
                channel.sendToQueue(queue, Buffer.from(JSON.stringify(queue_vote)));
            }).catch(err => console.log('amqp', err));
    }
}