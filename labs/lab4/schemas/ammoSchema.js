const Mongoose = require ('mongoose');

let ammoSchema = new Mongoose.Schema({
    // "_id": { type: mongoose.Schema.ObjectId }
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    stability: {
        type: Number,
        min: 0,
        max: 999999,
        required: true,
    },
    penetration: {
        type: Number,
        min: 0,
        max: 999999,
        required: true,
    },
}, {collection: 'ammo'});

module.exports = Mongoose.model("ammo", ammoSchema);
