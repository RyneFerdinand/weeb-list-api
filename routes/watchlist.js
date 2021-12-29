require("dotenv").config()

const axios = require("axios")
const express = require("express");
const { json } = require("express/lib/response");
const router = express.Router()
const Watchlist = require("../models/Watchlist")

router.post('/view', async (req, res) => {
    let watchlist;
    try {
        watchlist = await Watchlist.find({userID: req.body.userID});
        res.json(watchlist);
    } catch (error) {
        res.json(error.message);
    }    
})

router.post('/add', async (req, res) => {
    let watchlist = new Watchlist({
        userID: req.body.userID,
        animeID: req.body.animeID
    });

    try {
        const newWatchlist = await watchlist.save();
        res.json(newWatchlist);
    } catch (error) {
        res.json(error.message);
    }
})

router.patch('/update', async(req, res) => {
    let watchlist;
    try {
        watchlist = await Watchlist.findById(req.body.id);
        if(req.body.status != null){
            watchlist.status = req.body.status;
        }
        let updatedWatchlist = await watchlist.save();
        res.json(updatedWatchlist);
    } catch (error) {
        res.json(error.message);
    }
})

router.delete('/delete', async(req, res) => {
    let watchlist;
    try {
        watchlist = await Watchlist.findById(req.body.id);
        await watchlist.remove();
        res.json({ message: "Successfully Removed from Watchlist !" });
    } catch (error) {
        res.json(error.message);
    }
})

module.exports = router