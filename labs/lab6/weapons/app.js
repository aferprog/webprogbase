const express = require('express');
const app = express();
const apiRouter = require('./routes/apiRouter');
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