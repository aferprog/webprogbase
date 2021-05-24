const { json } = require('body-parser');
const config = require("../config");
const mongoose = require('mongoose');
const { ObjectID } = require("bson");
const jwt = require("jsonwebtoken");
const Weapon = require("../models/weapon");

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
const dbUrl = config.url;
const model = mongoose.model("weapons" , Weapon);

async function addWeapon(weapon)
{
    return mongoose.connect(dbUrl, connectOptions).then(() => model.insertMany(new model(weapon))).catch((error) => { res.status(500); return; });  
}

async function updateWeapon(weapon)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => {return model.find({})}).then(() => {return model.updateOne({"_id": weapon._id} , weapon)}).catch((error)=> {return 500;})
}

async function deleteWeapon(weapon)
{
    return mongoose.connect(dbUrl , connectOptions).then(() => model.find({})).then(() => {return model.remove({_id: weapon._id})}).catch((error)=> {return 500});
}

module.exports = {
    async weaponCRUD(message)
    {
        switch(message.type) {
            case 'add':
                delete message.type;
                await addWeapon(message);
                break;
            case 'update':
                delete message.type;
                await updateWeapon(message);
                break; 
            case 'delete':
                delete message.type;
                await deleteWeapon(message);
                break; 
            default:
                console.log("Error with weapon messages"); 
                break;
        }
    }
}
