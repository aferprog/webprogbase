const Weapon = require("../models/weapon");
const config = require("../config");
const { json } = require('body-parser');
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const amqp = require('amqplib');

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("weapons", Weapon);

function checkToken(token) {
    return jwt.verify(token, config.jwtSecret, (err, verifiedJwt) => {
        if (err) {
            return 401;
        }
        else {
            return true;
        }
    });
}

function unpackToken(token) {
    return jwt.decode(token);
}

async function getWeaponById(weaponId) {
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({ "_id": weaponId }) }).catch((error) => { return 500 });
}

async function getAllWeapons() {
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({}) }).catch((error) => { return 500 });
}

async function updateWeaponById(weapon)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => {return model.find({})}).then(() => {return model.updateOne({"_id": weapon._id} , weapon)}).catch((error)=> {return 500;})
}

module.exports = {
    async getWeaponById(req, res) {
        const weaponId = req.params.weaponId;
        const weapon = await getWeaponById(weaponId);
        if (weapon == 500 || weapon.length == 0) {
            res.status(500).send("Error");
        }
        res.status(200).json(weapon[0]);
    },

    async getWeapons(req, res) {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
        } else {
            const page = parseInt(req.query.page);
            const amount = parseInt(req.query.size);
            const offset = (page - 1) * amount;
            const weapons = await getAllWeapons();
            const new_weapons = weapons.slice(offset, offset + amount);
            res.status(200).json(new_weapons);
        }
    },

    async addWeapon(req, res) {
        if (req.body == null) {
            console.log(69);
            res.status(400).send("Error");
            return;
        }
        if (req.body.name == null || req.body.speed == null || req.body.damage == null) {
            console.log(74);
            res.status(400).send("Incorrect input");
            return;
        }
        const token = req.body.token;
        if (token == null && token == undefined) {
            console.log(80);
            res.status(401).send("Unauthorized!");
            return;
        }
        const check = checkToken(token);
        if (check == 401) {
            console.log(86);
            res.status(401).send("Unauthorized");
            return;
        }
        const author = unpackToken(token);
        const weapon = {
            _id: new ObjectID(),
            name: req.body.name,
            speed: req.body.speed,
            damage: req.body.damage,
            author: author.login
        }
        mongoose.connect(dbUrl, connectOptions).then(() => model.insertMany(new model(weapon))).catch((error) => { res.status(500); return; });
        res.status(201);
        res.json(weapon);
        weapon.type = 'add';
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'weapons';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(weapon)));
            }).catch(err => console.log('amqp' , err));
    },

    async updateWeapon(req, res) {
        if (req.body == null) {
            res.status(400).send("Error");
            return;
        }
        if (req.body._id == null || req.body.name == null || req.body.speed == null || req.body.damage == null) {
            res.status(400).send("Incorrect input");
            return;
        }
        const token = req.body.token;
        if (token == null && token == undefined) {
            res.status(401).send("Unauthorized!");
            return;
        }
        const check = checkToken(token);
        if (check == 401) {
            res.status(401).send("Unauthorized");
            return;
        }
        const author = unpackToken(token);
        const weapon = await getWeaponById(req.body._id);
        if(weapon == 500 || weapon.length == 0)
        {
            res.status(500).send("DB error");
            return;
        }
        if (weapon[0].author != author.login) {
            res.status(403).send("Forbidden operation");
            return;
        }
        const update_weapon = {
            _id: req.body._id,
            name: req.body.name,
            speed: req.body.speed,
            damage: req.body.damage,
            author: author.login
        }
        await updateWeaponById(update_weapon);
        res.status(200);
        res.json(update_weapon);
        update_weapon.type = 'update';
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'weapons';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(update_weapon)));
            }).catch(err => console.log('amqp' , err));
    },

    async deleteWeapon(req , res)
    {
        if (req.body == null) {
            res.status(400).send("Error");
            return;
        }
        const token = req.body.token;
        if (token == null && token == undefined) {
            res.status(401).send("Unauthorized!");
            return;
        }
        const check = checkToken(token);
        if (check == 401) {
            res.status(401).send("Unauthorized");
            return;
        }
        const author = unpackToken(token);
        var weapon = await getWeaponById(req.body._id);
        if (weapon == 500 || weapon.length == 0) {
            res.status(500).send("Error");
            return;
        }
        if(weapon[0].author != author.login)
        {
            res.status(403).send("Forbidden operation");
            return;
        }
        mongoose.connect(dbUrl , connectOptions).then(() => model.find({})).then(() => {return model.remove({_id: req.body._id})}).catch((error)=> {return 500});
        res.status(200).json(weapon[0]);
        weapon = weapon[0];
        const queue_weapon = {
            _id: weapon._id,
            name: weapon.name,
            speed: weapon.speed,
            damage: weapon.damage,
            author: weapon.author,
            type: 'delete'
        }
        amqp.connect(config.rabbitmq)
            .then(connection => {
                return connection.createChannel();
            })
            .then(channel => {
                const queue = 'weapons';
                channel.assertQueue(queue);
                channel.sendToQueue(queue , Buffer.from(JSON.stringify(queue_weapon)));
            }).catch(err => console.log('amqp' , err));
    }
}