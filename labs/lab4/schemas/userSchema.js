const Mongoose = require ('mongoose');

let userSchema = new Mongoose.Schema({
    // "_id": { type: mongoose.Schema.ObjectId }
    login: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: true
    },
    fullname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: false
    },
    role: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
    },
    registeredAt: {
        type: Date,
        default: Date.now()
    },
    avaUrl: {
        type: String,
    },
    isEnabled: {
        type: Boolean,
        default: true
    }
}, {collection: 'users'});

module.exports = Mongoose.model("users", userSchema);
