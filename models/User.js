const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    gender: String,
    joined: String,
    profileImage: String
});

module.exports = mongoose.model('User', userSchema)