//const Wepon = require('../models/wepon');
const JsonStorage = require('./jsonStorage');
const Model = require('./voteSchema');
 
class VoteRepository {
 
    constructor() {
        this.storage = new JsonStorage(Model);
        this.storage.connect();
    }

    addVote(user, weapon){
        const id = this.storage.insert({user: user, weapon: weapon});
        return id.then(id => {
            return {user: user, weapon: weapon};
        });
    }
    status(user, weapon) {
        return this.storage.getItems({user: user, weapon: weapon}).then(arr => arr.length>0);
    }
    async deleteVote(user, weapon){
        const wepon = (await this.storage.getItems({user: user, weapon: weapon}))[0];
        this.storage.delete({_id: wepon._id});
        return wepon;
    }
    
};
 
module.exports = VoteRepository;
