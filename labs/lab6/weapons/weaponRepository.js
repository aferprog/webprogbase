//const Wepon = require('../models/wepon');
const JsonStorage = require('./jsonStorage');
const Model = require('./weaponSchema');
 
class WeaponRepository {
 
    constructor() {
        this.storage = new JsonStorage(Model);
        this.storage.connect();
    }
 
    getWepons() {
        const wepons = this.storage.getItems({});
        return wepons;
    }

    async addWepon(wepon){
        const id = this.storage.insert(wepon);
        return id.then(id => this.getWeponById(id));
    }
 
    getWeponById(id) {
        return this.storage.getItems({_id: id}).then(x => x[0]);
    }
    async updateWepon(wepon) {
        const oldWepon = (await this.storage.getItems({_id: wepon._id}))[0];
        // console.log(oldWepon);
        wepon.createdAt = oldWepon.createdAt;
        wepon.author = oldWepon.author;
        if (!wepon.name) wepon.name = oldWepon.name; 
        if (!wepon.damage) wepon.damage = oldWepon.damage; 
        if (!wepon.speed ) wepon.speed = oldWepon.speed; 
        this.storage.update(wepon);
        return oldWepon;
    }
    async deleteWepon(id){
        const wepon = await this.getWeponById(id);
        this.storage.delete({_id: id});
        return wepon;
    }
    
};
 
module.exports = WeaponRepository;
