const Model = require("../schemas/ammoSchema");
const JsonStorage = require("../jsonStorage");

class AmmoRepository{

    constructor(){
        this.storage = new JsonStorage(Model);
        this.storage.connect();
    }

    getAmmo() {
        const ammos = this.storage.getItems({});
        return ammos;
    }
    async addAmmo(ammo){
        const id = this.storage.insert(ammo);
        return id.then(id => this.getAmmoById(id));
    }
    getAmmoById(id) {
        return this.storage.getItems({_id: id});
    }
    updateAmmo(ammo) {
        const oldAmmo = this.storage.getItems({_id: ammo._id});
        this.storage.update(ammo);
        return oldAmmo;
    }
    deleteAmmo(id){
        const ammo = this.getAmmoById(id);
        this.storage.delete({_id: id});
        return ammo;
    }
};

module.exports=AmmoRepository;
