// const { json } = require('body-parser');
// const { application } = require('express');
// const { query } = require('express');
const VoteRepository = require('./voteRepository');
const voteStorage = new VoteRepository();
const amqp = require('amqplib');
const jwt = require('jsonwebtoken');
const jwtSekret = "sekret";

module.exports={
    unvote(msg, callback){
        let vote1;
        let user;
        try{
            user = jwt.verify(msg.token, jwtSekret);
        }catch(err){
            console.log(err);
            callback(err);
            return;
        }
        const weapon = msg.weapon;
        voteStorage.status(user, weapon)
            .then(status=>{
                if (status===true) return voteStorage.deleteVote(user._id, weapon);
                    else return {};
            })
            .then(delItem=>{
                callback(null, delItem);
                vote1 = delItem;
                return amqp.connect('amqp://localhost');
            }).catch(err=>{
                console.log(err);
                callback(err);
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
    vote(msg, callback){
        let vote1;
        let user;
        try{
            user = jwt.verify(msg.token, jwtSekret);
        }catch(err){
            console.log(err);
            callback(err);
            return;
        }
        const weapon = msg.weapon;
        voteStorage.status(user, weapon)
            .then(status=>{
                if (status===false) return voteStorage.addVote(user._id, weapon);
                    else return {};
            })
            .then(vote=>{
                callback(null, vote);
                vote1 = vote;
                return amqp.connect('amqp://localhost');
            }).catch(err=>{
                console.log(err);
                callback(err);
            })
            .then(connection=>{
                return connection.createChannel();
            }).then(channel => {
                const queue = 'votes';
                channel.assertQueue(queue);
                channel.sendToQueue(queue, JSON.stringify({'type': '+', 'vote': vote1}));
            })
            .catch(err => console.log(`amqp`, err));
    }
};