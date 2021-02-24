const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/api");
const configApp = require("./config").dev.app;
const configDB = require("./config").dev.db;
require('dotenv').config();
const Mongoose=require('mongoose');

const app = express();

const busboy = require('busboy-body-parser');

const optionsBBP = {
   limit: '5mb',
   multi: false,
};
app.use(busboy(optionsBBP));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/", router);

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Incorrect JSON');
});
 
const expressSwaggerGenerator = require('express-swagger-generator');
const expressSwagger = expressSwaggerGenerator(app);
 
const options = {
    swaggerDefinition: {
        info: {
            description: 'Working with Users and Weapons',
            title: 'LABA 4',
            version: '1.0.0',
        },
        host: `${configApp.host}`,
        produces: [ "application/json" ],
    },
    basedir: __dirname,
    files: ['./routes/**/*.js', './models/**/*.js'],
};
expressSwagger(options);

app.listen(configApp.port, ()=>{
    console.log("Server is listening");
    const conOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    };
    const url = `${configDB.key}://${configDB.host}:${configDB.port}/${configDB.name}`;
    Mongoose.connect(url, conOptions)
        .then(client=>{
            console.log("Mongo database is connected");
        })
        .catch(err=>{
            console.log("ERROR WITH Mongo");
        });
});