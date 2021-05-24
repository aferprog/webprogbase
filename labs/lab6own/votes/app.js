const express = require('express');
const app = express();
const apiRouter = require('./routes/apiRoute');
const path = require('path');
port = process.env.port || 4444;

app.use('' , apiRouter);

app.listen(port , err => {
    if(err)
    {
        return console.log("ERROR" , err);
    }
    console.log('listening on port ' + port);
});