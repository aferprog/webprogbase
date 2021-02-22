const User = require('../models/user');
const JsonStorage = require('../jsonStorage');
 
class UserRepository {
 
    constructor(filePath) {
        this.storage = new JsonStorage(filePath);
    }
 
    getUsers() { 
        const users = this.storage.readItems();
        return users;
    }
 
    getUserById(id) {
        const items = this.storage.readItems();
        for (const item of items) {
            if (item.id === id) {
                return new User(item.id, item.login, item.fullname, item.role, item.registeredAt, item.avaUrl, item.isEnabled);
            }
        }
        return null;
    }
};
 
module.exports = UserRepository;
