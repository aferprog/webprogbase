//const User = require('../models/user');
const JsonStorage = require('../jsonStorage');
const Model = require('../schemas/userSchema');
//const Mongoose = require('mongoose');
 
class UserRepository {
 
    constructor() {
        const userModel = Model;
        this.storage = new JsonStorage(userModel);
        this.storage.connect();
    }

    async getUsers() {
        const users = this.storage.getItems();
        return users;
    }
 
    async getUserById(id) {
        return this.storage.getItems({_id: id}).then(x => x[0]);
    }
};
 
module.exports = UserRepository;
