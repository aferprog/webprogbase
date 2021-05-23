// require('dotenv').config();
const Mongoose = require('mongoose');
const jayson = require('jayson/promise');
const rpsFunctions = require('./controllers/weapons');
// create a server
const rpcServer = jayson.server(rpsFunctions);

const conOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const url = `${configDB.key}://${configDB.host}:${configDB.port}/${configDB.name}`;
Mongoose.connect(url, conOptions)
    .then(client=>{
        rpcServer.http().listen(port);
        console.log("`QUERY`: Server is ready.");
    })
    .catch(err=>{
        console.log("`QUERY`: ERROR WITH Mongo");
    });