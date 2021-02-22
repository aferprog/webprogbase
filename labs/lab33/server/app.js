const express = require("express");
const bodyParser = require("body-parser");
const router = require("./routes/api");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", router);

const expressSwaggerGenerator = require('express-swagger-generator');
const expressSwagger = expressSwaggerGenerator(app);
 
const options = {
    swaggerDefinition: {
        info: {
            description: 'Working with Users and Wepons',
            title: 'LABA 2',
            version: '1.0.0',
        },
        host: 'localhost:3000',
        produces: [ "application/json" ],
    },
    basedir: __dirname,
    files: ['./routes/**/*.js', '../models/**/*.js'],
};
expressSwagger(options);


app.listen(3000, ()=>{console.log("Server is ready");});