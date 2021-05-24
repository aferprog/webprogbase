const Mongoose = require ('mongoose');

let voteSchema = new Mongoose.Schema({
    // "_id": { type: mongoose.Schema.ObjectId }

    user: {
        type: Mongoose.Schema.ObjectId,
        required: true,
        unique: false
    },
    weapon: {
        type: Mongoose.Schema.ObjectId,
        required: true,
        unique: false
    },
    date: {
        type: Date,
        default: Date.now()
    }
}, {collection: 'votes'});

module.exports = Mongoose.model("votes", voteSchema);
