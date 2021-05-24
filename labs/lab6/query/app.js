const express = require('express');
const app = express();
const apiRouter = require('./routes/apiRouter');
const path = require('path');
const amqp = require('amqplib');
const config = require('./config');
const { connection } = require('mongoose');
const port = require('./config').port;
const authController = require('./controllers/authController');
const weaponController = require('./controllers/weaponController');
const voteController = require('./controllers/voteController');

amqp.connect(config.rabbitmq)
    .then(connection => {
        return connection.createChannel();
    })
    .then(channel => {
        const queue = 'auth';
        channel.assertQueue(queue);
        channel.consume(queue, async msg => {
            const message = JSON.parse(msg.content, toString());
            await authController.authCRUD(message);
            channel.ack(msg);
        })
    }).catch(err => console.log('amqp', err));

amqp.connect(config.rabbitmq)
    .then(connection => {
        return connection.createChannel();
    })
    .then(channel => {
        const queue = 'weapons';
        channel.assertQueue(queue);
        channel.consume(queue, async msg => {
            const message = JSON.parse(msg.content, toString());
            await weaponController.weaponCRUD(message);
            channel.ack(msg);
        })
    }).catch(err => console.log('amqp', err));

amqp.connect(config.rabbitmq)
    .then(connection => {
        return connection.createChannel();
    })
    .then(channel => {
        const queue = 'votes';
        channel.assertQueue(queue);
        channel.consume(queue, async msg => {
            const message = JSON.parse(msg.content, toString());
            console.log(message);
            await voteController.voteCRUD(message);
            channel.ack(msg);
        })
    }).catch(err => console.log('amqp', err));

app.use('', apiRouter);

app.listen(port, err => {
    if (err) {
        return console.log("ERROR", err);
    }
    console.log('listening on port ' + port);
});