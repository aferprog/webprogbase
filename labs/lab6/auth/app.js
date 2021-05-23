// require('dotenv').config();
const Mongoose = require('mongoose');
const jayson = require('jayson/promise');
const rpsFunctions = require('./usersController');
// create a server
const rpcServer = jayson.server(rpsFunctions);

const conOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const url = `mongodb+srv://root:root@cluster0.omhx8.mongodb.net/auth?retryWrites=true&w=majority`;
Mongoose.connect(url, conOptions)
    .then(client=>{
        rpcServer.http().listen(3000);
        console.log("`AUTH`: Server is ready.");
    })
    .catch(err=>{
        console.log("`AUTH`: ERROR WITH Mongo");
    });
