const Book = require("../models/book");
const config = require("../config");
const { json } = require('body-parser');
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const amqp = require('amqplib');

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("Book", Book);

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

async function getBookById(bookId) {
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({ "_id": bookId }) }).catch((error) => { return 500 });
}

async function getAllBooks() {
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({}) }).catch((error) => { return 500 });
}

async function updateBookById(book)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => {return model.find({})}).then(() => {return model.updateOne({"_id": book._id} , book)}).catch((error)=> {return 500;})
}

module.exports = {
    async getBookById(req, res) {
        const bookId = req.params.bookId;
        const book = await getBookById(bookId);
        if (book == 500 || book.length == 0) {
            res.status(500).send("Error");
        }
        res.status(200).json(book[0]);
    },

    async getBooks(req, res) {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
        } else {
            const page = parseInt(req.query.page);
            const amount = parseInt(req.query.size);
            const offset = (page - 1) * amount;
            const books = await getAllBooks();
            const new_books = books.slice(offset, offset + amount);
            res.status(200).json(new_books);
        }
    },

    async addBook(req, res) {
        if (req.body == null) {
            res.status(400).send("Error");
            return;
        }
        if (req.body.title == null || req.body.pages == null || req.body.author == null) {
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
        const book = {
            _id: new ObjectID(),
            title: req.body.title,
            pages: req.body.pages,
            author: req.body.author,
            user: user.login
        }
        mongoose.connect(dbUrl, connectOptions).then(() => model.insertMany(new model(book))).catch((error) => { res.status(500); return; });
        res.status(201);
        res.json(book);
        book.type = 'add';
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'books';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(book)));
            }).catch(err => console.log('amqp' , err));
    },

    async updateBook(req, res) {
        if (req.body == null) {
            res.status(400).send("Error");
            return;
        }
        if (req.body._id == null || req.body.title == null || req.body.pages == null || req.body.author == null) {
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
        const book = await getBookById(req.body._id);
        if(book == 500 || book.length == 0)
        {
            res.status(500).send("DB error");
            return;
        }
        if (book[0].user != user.login) {
            res.status(403).send("Forbidden operation");
            return;
        }
        const update_book = {
            _id: req.body._id,
            title: req.body.title,
            pages: req.body.pages,
            author: req.body.author,
            user: user.login
        }
        await updateBookById(update_book);
        res.status(200);
        res.json(update_book);
        update_book.type = 'update';
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'books';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(update_book)));
            }).catch(err => console.log('amqp' , err));
    },

    async deleteBook(req , res)
    {
        if (req.body == null) {
            res.status(400).send("Error");
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
        var book = await getBookById(req.body._id);
        if (book == 500 || book.length == 0) {
            res.status(500).send("Error");
            return;
        }
        if(book[0].user != user.login)
        {
            res.status(403).send("Forbidden operation");
            return;
        }
        mongoose.connect(dbUrl , connectOptions).then(() => model.find({})).then(() => {return model.remove({_id: req.body._id})}).catch((error)=> {return 500});
        res.status(200).json(book[0]);
        book = book[0];
        const queue_book = {
            _id: book._id,
            title: book.title,
            pages: book.pages,
            author: book.author,
            user: book.user,
            type: 'delete'
        }
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'books';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(queue_book)));
            }).catch(err => console.log('amqp' , err));
    }
}