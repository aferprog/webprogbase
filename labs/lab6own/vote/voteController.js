// const { json } = req.bodyuire('body-parser');
// const { application } = req.bodyuire('express');
// const { query } = req.bodyuire('express');
const VoteRepository = require('./voteRepository');
const voteStorage = new VoteRepository();
const amqp = require('amqplib');
const jwt = require('jsonwebtoken');
const jwtSekret = "sekret";

module.exports={
    unvote(req, res){
        let vote1;
        let user;
        try{
            user = jwt.verify(req.body.token, jwtSekret);
        }catch(err){
            console.log(err);
            res.send(null);
            return;
        }
        const weapon = req.body.weapon;
        voteStorage.status(user, weapon)
            .then(status=>{
                if (status===true) return voteStorage.deleteVote(user._id, weapon);
                    else return null;
            })
            .then(delItem=>{
                res.send(delItem);
                vote1 = delItem;
                return amqp.connect('amqp://localhost');
            }).catch(err=>{
                console.log(err);
                res.send(null);
            })
            .then(connection=>{
                return connection.createChannel();
            }).then(channel => {
                const queue = 'votes';
                channel.assertQueue(queue);
                channel.sendToQueue(queue, JSON.stringify({'type': '-', 'vote': vote1}));
            })
            .catch(err => console.log(`amqp`, err));
    },
    vote(req, res){
        let vote1;
        let user;
        try{
            user = jwt.verify(req.body.token, jwtSekret);
        }catch(err){
            console.log(err);
            res.send(null);
            return;
        }
        const weapon = req.body.weapon;
        voteStorage.status(user, weapon)
            .then(status=>{
                if (status===false) return voteStorage.addVote(user._id, weapon);
                    else return null;
            })
            .then(vote=>{
                res.send(vote);
                vote1 = vote;
                return amqp.connect('amqp://localhost');
            }).catch(err=>{
                console.log(err);
                res.send(null);
            })
            .then(connection=>{
                return connection.createChannel();
            }).then(channel => {
                const queue = 'votes';
                channel.assertQueue(queue);
                channel.sendToQueue(queue, JSON.stringify({'type': '+', 'vote': vote1}));
            })
            .catch(err => {
                console.log(`amqp`, err);
                res.send(null);
            });
    }
};