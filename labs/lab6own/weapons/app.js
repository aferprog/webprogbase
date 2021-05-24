// require('dotenv').config();
const Mongoose = require('mongoose');
// const jayson = require('jayson/promise');
const express = require("express");
const bodyParser = require("body-parser");
const router = require("./weaponsRouter");
const app = express();

const conOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
};
const url = `mongodb+srv://root:root@cluster0.omhx8.mongodb.net/weapons?retryWrites=true&w=majority`;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/", router);

app.listen(3000, ()=>{
    Mongoose.connect(url, conOptions)
    .then(client=>{
        console.log("`VOTE`: Server is ready.");
    })
    .catch(err=>{
        console.log("`VOTE`: ERROR WITH Mongo");
    });
});
