const User = require("../models/user");
const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const amqp = require('amqplib');

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("User" , User);

function checkToken(token)
{
    return jwt.verify(token , config.jwtSecret , (err , verifiedJwt) => {
        if(err)
        {
            return 401;
        }
        else
        {
            return true;
        }
    });
}

function unpackToken(token)
{
    return jwt.decode(token);
}

function createToken(login , password)
{
    const token = jwt.sign({login: login , password: password} , config.jwtSecret);
    return token;
}

async function checkSignIn(login , password)
{
    const users = await getAllUsers();
    if(users == 500)
    {
        return 500;
    }
    for(i = 0; i < users.length; i++)
    {
        if(users[i].login == login && users[i].password == password)
        {
            return true;
        }
    }
    return false;
}

async function getAllUsers()
{
    return mongoose.connect(dbUrl , connectOptions).then(() => {return model.find({})}).catch((error)=>{return 500});
}

async function getUserByAuth(login , password)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => {return model.find({"login": login , "password": password})}).catch((error) => {return 500});
}

async function getUserById(id)
{
    return mongoose.connect(dbUrl , connectOptions).then(()=> {return model.find({"_id": id})}).catch((error)=>{return 500});
}

async function checkUser(login)
{
    const users = await getAllUsers();
    if(users == 500)
    {
        return 500;
    }
    for(i = 0; i < users.length; i++)
    {
        if(users[i].login == login)
        {
            return false;
        }
    }
    return true;
}

module.exports = {
    async register(req, res) {
        if(req.body == null)
        {
            res.status(400).send("Error");
            return;
        }
        if(req.body.login == null || req.body.password == null)
        {
            res.status(400).send("Incorrect input");
            return;
        }
        const user_id = new ObjectID();
        const user_login = req.body.login;
        const user_password = req.body.password;
        if(await checkUser(user_login) != true)
        {
            res.status(500).send("Error checking user");
            return;
        }
        const user_date = new Date();
        const user = {
            _id: user_id,
            login: user_login,
            password: user_password,
            registeredAt: user_date
        }
        mongoose.connect(dbUrl , connectOptions).then(() => model.insertMany(new model(user))).catch((error)=> {res.status(500); return;});
        res.status(201);
        res.json(user);
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'auth';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(user)));
            }).catch(err => console.log('amqp' , err));
    },

    async login(req, res){
        if(req.body == null)
        {
            res.status(400).send("Error");
            return;
        }
        if(req.body.login == null || req.body.password == null)
        {
            res.status(400).send("Incorrect input");
            return;
        }
        const user_login = req.body.login;
        const user_password = req.body.password;
        if(await checkSignIn(user_login,user_password) != true)
        {
            res.status(401).send("Dismatch");
            return;
        }
        const token = createToken(user_login , user_password);

        const result = {
            token: token,
            login: user_login
        }
        res.status(201).json(result);
    },

    async usernameExists(req , res){
        if(req.query == null)
        {
            res.status(500).send("Error");
            return;
        }
        if(req.query.login == null)
        {
            res.status(500).send("No login");
            return;
        }
        const user_login = req.query.login;
        var result;
        if(await checkUser(user_login) == false)
        {
            result = true;
        }
        else if(await checkUser(user_login) == true)
        {
            result = false;
        }
        else{
            res.status(500).send("Error");
            return;
        }
        res.status(200).json(result);
    },

    async userById(req, res){
        const userId = req.params.userId;
        const user = await getUserById(userId);
        if(user.length == 0 || user == 500)
        {
            res.status(500).send("Db Error");
        }
        res.status(200).json(user[0]);
    },

    async users(req, res){
        const users = await getAllUsers();
        if(users == 500)
        {
            res.status(500).send("Error");
            return;
        }
        res.status(200).json(users);
    },

    async me(req, res)
    {
        if(req.query == null)
        {
            res.status(400).send("Error");
            return;
        }
        if(req.query.token == null)
        {
            res.status(400).send("Incorrect input");
            return;
        }
        const token = req.query.token;
        const verify = checkToken(token);
        if(verify == 401)
        {
            res.status(401).send("Incorrect token");
            return;
        }
        const user = unpackToken(token);
        if(await checkSignIn(user.login,user.password) != true)
        {
            res.status(401).send("Dismatch");
            return;
        }
        const result = await getUserByAuth(user.login , user.password);
        res.status(200).json({_id: result[0]._id , login: result[0].login , registeredAt: result[0].registeredAt});
    }
}