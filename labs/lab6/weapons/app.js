// require('dotenv').config();
const Mongoose = require('mongoose');
const jayson = require('jayson/promise');
const rpsFunctions = require('./weaponsController');
// create a server
const rpcServer = jayson.server(rpsFunctions);

const conOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const url = `mongodb+srv://root:root@cluster0.omhx8.mongodb.net/weapons?retryWrites=true&w=majority`;
Mongoose.connect(url, conOptions)
    .then(client=>{
        rpcServer.http().listen(3000);
        console.log("`WEAPONS`: Server is ready.");
    })
    .catch(err=>{
        console.log(err);
        console.log("`WEAPONS`: ERROR WITH Mongo");
    });