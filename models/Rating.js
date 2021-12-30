const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true
    },
    animeID:{
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Rating', ratingSchema)