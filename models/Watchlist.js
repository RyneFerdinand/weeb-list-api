const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userID:{
        type: Object,
        required: true
    },
    animeID:{
        type: Number,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Watchlist', watchlistSchema)