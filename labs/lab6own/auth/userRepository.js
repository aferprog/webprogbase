const JsonStorage = require('./jsonStorage');
const Model = require('./userSchema');
 
class UserRepository {
 
    constructor() {
        const userModel = Model;
        this.storage = new JsonStorage(userModel);
        this.storage.connect();
    }

    async getUsers(ops={}) {
        const users = this.storage.getItems(ops);
        return users;
    }
 
    async getUserById(id) {
        return this.storage.getItems({_id: id}).then(x => x[0]);
    }

    async addUser(user){
        const id = this.storage.insert(user);
        return id.then(id => this.getUserById(id));
    }
};
 
module.exports = UserRepository;
