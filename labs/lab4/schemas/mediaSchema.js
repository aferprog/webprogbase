const Mongoose = require ('mongoose');

let mediaSchema = new Mongoose.Schema({
    // "_id": { type: mongoose.Schema.ObjectId }
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    }
}, {collection: 'media'});

module.exports = Mongoose.model("media", mediaSchema);
