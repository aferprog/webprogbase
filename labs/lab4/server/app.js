const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/api");
const config = require("./config").dev.app;
//const Mongoose=require('mongoose');

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
    console.error(err.stack)
    res.status(500).send('Something broke!')
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
        host: `localhost:${config.port}`,
        produces: [ "application/json" ],
    },
    basedir: __dirname,
    files: ['./routes/**/*.js', '../models/**/*.js'],
};
expressSwagger(options);

app.listen(config.port, ()=>{
    console.log("Server is listening");
});