const config = require('../config').cloudinary;
const cloudinary = require('cloudinary');
const Model = require("../schemas/mediaSchema");
const JsonStorage = require("../jsonStorage");

cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});

class MediaRepository {
    constructor(){
        this.storage = new JsonStorage(Model);
        this.storage.connect();
    }

    getMediaById(id) {
        return this.storage.getItems({_id: id});
    }

    async uploadRaw(buffer, type){
        const res = new Promise((resolve, reject) => {
            cloudinary.v2.uploader
                .upload_stream(
                { resource_type: 'raw' }, 
                (err, result) => {
                    if (err) {
                    reject(err);
                    } else {
                    resolve(result);
                    }
                })
                .end(buffer);
            });
        return res.then(res=>{
            const img = {
                url: res.url,
                type: type
            }
            const id = this.storage.insert(img);
            return id.then(id => this.getMediaById(id));
        });
    }
};
 
module.exports = MediaRepository;