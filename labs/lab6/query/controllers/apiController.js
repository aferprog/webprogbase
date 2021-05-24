const config = require("../config");
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const Weapon = require("../models/weapon");
const Vote = require("../models/vote");
const User = require("../models/user");

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;

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

async function getUser(user) {
    const model = mongoose.model("users", User);
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({ "login": user }) }).catch((error) => { return 500 });
}

async function getWeapons() {
    const model = mongoose.model("weapons", Weapon);
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({}) }).catch((error) => { return 500 });
}

async function getVotesByWeaponId(weaponId) {
    const model = mongoose.model("votes", Vote);
    return mongoose.connect(dbUrl, connectOptions).then(() => { return model.find({ "weapon_id": weaponId }).sort({ "time": "desc" }) }).catch((error) => { return 500 });
}

async function createQueryEntities() {
    const weaponsVotes = new Array();
    const weapons = await getWeapons();
    for (i = 0; i < weapons.length; i++) {
        const result = {
            weapon_id: weapons[i]._id,
            name: weapons[i].name,
            votes: null
        }
        const votes = await getVotesByWeaponId(weapons[i]._id);
        if (votes == 500 || votes.length == 0) {
            weaponsVotes.push(result);
            continue;
        } else {
            const result_votes = new Array();
            for (j = 0; j < votes.length; j++) {
                const user = await getUser(votes[j].user);
                const voteUser = {
                    user_id: user[0]._id,
                    login: user[0].login
                }
                const vote = {
                    time: votes[j].time,
                    user: voteUser
                }
                result_votes.push(vote);
            }
            result.votes = result_votes;
        }
        weaponsVotes.push(result);
    }
    return weaponsVotes;
}

module.exports = {
    async weaponsVotes(req, res) {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
            return;
        }
        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.size);
        const offset = (page - 1) * amount;
        const weaponsVotes = await createQueryEntities();
        const new_weaponsVotes = weaponsVotes.slice(offset, offset + amount);
        res.status(200).json(new_weaponsVotes);
    },

    async weaponsByIdVotes(req, res) {
        if (req.params.id == null) {
            res.status(400).send("Bad request");
            return;
        }
        const weaponId = req.params.id;
        const weaponsVotes = await createQueryEntities();
        for (i = 0; i < weaponsVotes.length; i++) {
            if (weaponsVotes[i].weapon_id == weaponId) {
                res.status(200).json(weaponsVotes[i]);
                return;
            }
        }
        res.status(404).send("Not found");
    },

    async userByIdVotes(req, res) {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
            return;
        }
        if (req.params.id == null) {
            res.status(400).send("Bad request");
            return;
        }
        const userId = req.params.id;
        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.size);
        const offset = (page - 1) * amount;
        const weaponsVotes = await createQueryEntities();
        const result = new Array();
        for (i = 0; i < weaponsVotes.length; i++) {
            if (weaponsVotes[i].votes == null) {
                continue;
            }
            for (j = 0; j < weaponsVotes[i].votes.length; j++) {
                if (weaponsVotes[i].votes[j].user.user_id == userId) {
                    result.push(weaponsVotes[i]);
                }
            }
        }
        const new_result = result.slice(offset, offset + amount);
        res.status(200).json(new_result);;
    },

    async meVotes(req , res)
    {
        if (req.query.page == null || req.query.size == null) {
            res.status(400).send("Bad request");
            return;
        }
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
        const fullUser = await getUser(user.login);
        const page = parseInt(req.query.page);
        const amount = parseInt(req.query.size);
        const offset = (page - 1) * amount;
        const weaponsVotes = await createQueryEntities();
        const result = new Array();
        for (i = 0; i < weaponsVotes.length; i++) {
            if (weaponsVotes[i].votes == null) {
                continue;
            }
            for (j = 0; j < weaponsVotes[i].votes.length; j++) {
                if (weaponsVotes[i].votes[j].user.user_id.toString() == fullUser[0]._id.toString()) {
                    result.push(weaponsVotes[i]);
                }
            }
        }
        const new_result = result.slice(offset, offset + amount);
        res.status(200).json(new_result);;
    }
}