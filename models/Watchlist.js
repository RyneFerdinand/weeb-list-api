const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true
    },
    animeID:{
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "Planned"
    }
});

module.exports = mongoose.model('Watchlist', watchlistSchema)