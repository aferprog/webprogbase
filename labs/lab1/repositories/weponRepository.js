const Wepon = require('../models/wepon');
const JsonStorage = require('../jsonStorage');
 
class UserRepository {
 
    constructor(filePath) {
        this.storage = new JsonStorage(filePath);
    }
 
    getWepons() { 
        const wepons = this.storage.readItems();
        return wepons;
    }

    addWepon(name, author, damage, speed, createdAt){
        const id=this.storage.nextId;
        this.storage.incrementNextId();
        const wepon= new Wepon(id ,name, author, damage, speed, createdAt);
        let items = this.storage.readItems();
        items.push(wepon);
        this.storage.writeItems(items);
        return id;
    }
 
    getWeponById(id) {
        const items = this.storage.readItems();
        for (const item of items) {
            if (item.id === id) {
                return new Wepon(item.id, item.name, item.author, item.damage, item.speed, item.createdAt);
            }
        }
        return null;
    }
    updateWepon(wepon) {
        let items = this.storage.readItems();
        for (const i in items) {
            if (items[i].id === wepon.id) {
                items[i]=wepon;
            }
        }
        this.storage.writeItems(items);
    }
    deleteWepon(id){
        const items = this.storage.readItems();
        const newItems = items.filter(item=> item.id!==id);
        if (items.length===newItems.length) return false;
        
        this.storage.writeItems(newItems);
        return true;
    }
    
};
 
module.exports = UserRepository;
