const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const Book = require("../models/book");

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("Book" , Book);

async function addBook(book)
{
    return mongoose.connect(dbUrl, connectOptions).then(() => model.insertMany(new model(book))).catch((error) => { res.status(500); return; });  
}

async function updateBook(book)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => {return model.find({})}).then(() => {return model.updateOne({"_id": book._id} , book)}).catch((error)=> {return 500;})
}

async function deleteBook(book)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => model.find({})).then(() => {return model.remove({_id: book._id})}).catch((error)=> {return 500});
}

module.exports = {
    async bookCRUD(message)
    {
        switch(message.type) {
            case 'add':
                delete message.type;
                await addBook(message);
                break;
            case 'update':
                delete message.type;
                await updateBook(message);
                break; 
            case 'delete':
                delete message.type;
                await deleteBook(message);
                break; 
            default:
                console.log("Error with book messages"); 
                break;
        }
    }
}
