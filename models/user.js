const mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
});

userSchema.plugin(passportLocalMongoose);

let Users = mongoose.model('User',userSchema);

module.exports = Users;