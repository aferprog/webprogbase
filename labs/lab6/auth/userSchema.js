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
    password: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: false
    },
    fullname: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        unique: false
    },
    registeredAt: {
        type: Date,
        default: Date.now()
    }
}, {collection: 'users'});

module.exports = Mongoose.model("users", userSchema);
