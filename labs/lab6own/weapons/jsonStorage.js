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
        return await this.model.find(options);
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