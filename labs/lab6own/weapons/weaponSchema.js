const Mongoose = require ('mongoose');

let weaponSchema = new Mongoose.Schema({
    // "_id": { type: mongoose.Schema.ObjectId }

    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    author: {
        type: Mongoose.Schema.ObjectId,
        required: true,
        unique: false
    },
    damage: {
        type: Number,
        min: 0,
        max: 999999,
        required: true,
    },
    speed: {
        type: Number,
        min: 0,
        max: 999999,
        required: true,
    },
    CreatedAt: {
        type: Date,
        default: Date.now()
    }
}, {collection: 'weapons'});

module.exports = Mongoose.model("weapons", weaponSchema);