const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const Book = require("../models/book");
const Vote = require("../models/vote");
const User = require("../models/user");

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;

function checkToken(token)
{
    return jwt.verify(token , config.jwtSecret , (err , verifiedJwt) => {
        if(err)
        {
            return 401;
        }
        else
        {
            return true;
        }
    });
}

function unpackToken(token)
{
    return jwt.decode(token);
}

async function getUser(user) {
    const model = mongoose.model("User", User);
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({ "login": user }) }).catch((error) => { return 500 });
}

async function getBooks() {
    const model = mongoose.model("Book", Book);
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({}) }).catch((error) => { return 500 });
}

async function getVotesByBookId(bookId) {
    const model = mongoose.model("Vote", Vote);
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({ "book_id": bookId }).sort({ "time": "desc" }) }).catch((error) => { return 500 });
}

async function createQueryEntities() {
    const booksVotes = new Array();
    const books = await getBooks();
    for (i = 0; i < books.length; i++) {
        const result = {
            book_id: books[i]._id,
            title: books[i].title,
            votes: null
        }
        const votes = await getVotesByBookId(books[i]._id);
        if (votes == 500 || votes.length == 0) {
            booksVotes.push(result);
            continue;
        } else {
            const result_votes = new Array();
            for (j = 0; j < votes.length; j++) {
                const user = await getUser(votes[j].user);
                const voteUser = {
                    user_id: user[0]._id,
                    login: user[0].login
                }
                const vote = {
                    time: votes[j].time,
                    user: voteUser
                }
                result_votes.push(vote);
            }
            result.votes = result_votes;
        }
        booksVotes.push(result);
    }
    return booksVotes;
}

module.exports = {
    async booksVotes(req, res) {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
            return;
        }
        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.size);
        const offset = (page - 1) * amount;
        const booksVotes = await createQueryEntities();
        const new_booksVotes = booksVotes.slice(offset, offset + amount);
        res.status(200).json(new_booksVotes);
    },

    async booksByIdVotes(req, res) {
        if (req.params.id == null) {
            res.status(400).send("Bad request");
            return;
        }
        const bookId = req.params.id;
        const booksVotes = await createQueryEntities();
        for (i = 0; i < booksVotes.length; i++) {
            if (booksVotes[i].book_id == bookId) {
                res.status(200).json(booksVotes[i]);
                return;
            }
        }
        res.status(404).send("Not found");
    },

    async userByIdVotes(req, res) {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
            return;
        }
        if (req.params.id == null) {
            res.status(400).send("Bad request");
            return;
        }
        const userId = req.params.id;
        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.size);
        const offset = (page - 1) * amount;
        const booksVotes = await createQueryEntities();
        const result = new Array();
        for (i = 0; i < booksVotes.length; i++) {
            if (booksVotes[i].votes == null) {
                continue;
            }
            for (j = 0; j < booksVotes[i].votes.length; j++) {
                if (booksVotes[i].votes[j].user.user_id == userId) {
                    result.push(booksVotes[i]);
                }
            }
        }
        const new_result = result.slice(offset, offset + amount);
        res.status(200).json(new_result);;
    },

    async meVotes(req , res)
    {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
            return;
        }
        if(req.query == null)
        {
            res.status(400).send("Error");
            return;
        }
        if(req.query.token == null)
        {
            res.status(400).send("Incorrect input");
            return;
        }
        const token = req.query.token;
        const verify = checkToken(token);
        if(verify == 401)
        {
            res.status(401).send("Incorrect token");
            return;
        }
        const user = unpackToken(token);
        const fullUser = await getUser(user.login);
        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.size);
        const offset = (page - 1) * amount;
        const booksVotes = await createQueryEntities();
        const result = new Array();
        for (i = 0; i < booksVotes.length; i++) {
            if (booksVotes[i].votes == null) {
                continue;
            }
            for (j = 0; j < booksVotes[i].votes.length; j++) {
                if (booksVotes[i].votes[j].user.user_id.toString() == fullUser[0]._id.toString()) {
                    result.push(booksVotes[i]);
                }
            }
        }
        const new_result = result.slice(offset, offset + amount);
        res.status(200).json(new_result);;
    }
}