//const fs=require('fs');
const Mongoose=require('mongoose');
const config = require('./config').dev.db;

class MongoDB{
    constructor(model){
        this.model = model;
    }
    async connect(){
        
    }
    async close(){
        await this.client.disconnect()
            .catch(err=>{});;
    }
    async getItems(options={}, pop=""){
        if (pop==="")
            return await this.model.find(options);
        return await this.model.find(options).populate("author").populate("ammo");
    }
    async delete(options){
        await this.model.findByIdAndDelete(options)
            .catch(err=>{});;
    }
    async update(item){
        await this.model.findByIdAndUpdate(item._id, item)
            .catch(err=>{});
    }
    async insert(item){
        const id = await this.model(item).save();
        return id;
    }
}

module.exports = MongoDB;