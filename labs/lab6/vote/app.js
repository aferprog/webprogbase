// require('dotenv').config();
const Mongoose = require('mongoose');
const jayson = require('jayson/promise');
const rpsFunctions = require('./voteController');
// create a server
const rpcServer = jayson.server(rpsFunctions);

const conOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const url = `mongodb+srv://root:root@cluster0.omhx8.mongodb.net/votes?retryWrites=true&w=majority`;
Mongoose.connect(url, conOptions)
    .then(client=>{
        rpcServer.http().listen(3000);
        console.log("`VOTE`: Server is ready.");
    })
    .catch(err=>{
        console.log("`VOTE`: ERROR WITH Mongo");
    });