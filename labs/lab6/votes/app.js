const express = require('express');
const app = express();
const apiRouter = require('./routes/apiRoute');
const path = require('path');
const port = require('./config').port;

app.use('' , apiRouter);

app.listen(port , err => {
    if(err)
    {
        return console.log("ERROR" , err);
    }
    console.log('listening on port ' + port);
});