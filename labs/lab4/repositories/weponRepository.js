//const Wepon = require('../models/wepon');
const JsonStorage = require('../jsonStorage');
const Model = require('../schemas/weponSchema');
 
class UserRepository {
 
    constructor() {
        this.storage = new JsonStorage(Model);
        this.storage.connect();
    }
 
    getWepons(pop=true) {
        if (pop) pop="author";
            else pop="";
        const wepons = this.storage.getItems({},pop);
        return wepons;
    }

    async addWepon(wepon){
        const id = this.storage.insert(wepon);
        return id.then(id => this.getWeponById(id));
    }
 
    getWeponById(id, pop=true) {
        if (pop) pop = "author";
            else pop = "";
        return this.storage.getItems({_id: id}, pop);
    }
    updateWepon(wepon) {
        const oldWepon = this.storage.getItems({_id: wepon._id});
        this.storage.update(wepon);
        return oldWepon;
    }
    deleteWepon(id){
        const wepon = this.getWeponById(id);
        this.storage.delete({_id: id});
        return wepon;
    }
    
};
 
module.exports = UserRepository;
