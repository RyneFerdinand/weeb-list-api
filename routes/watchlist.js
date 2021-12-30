require("dotenv").config()

const axios = require("axios")
const express = require("express");
const { json } = require("express/lib/response");
const router = express.Router()
const Watchlist = require("../models/Watchlist")
const Rating = require("../models/Rating");
const API2_URL = process.env.API2_URL;

router.post('/search', async(req, res) => {
    let watchlist;
    try {
        watchlist = await Watchlist.findOne({userID: req.body.userID, animeID: req.body.animeID});
        res.json(watchlist);
    } catch (error) {
        res.json(error.message);
    } 
})

router.post('/view', async (req, res) => {

    let watchlistData = [];
    try {
        Watchlist.aggregate([{
            $lookup: {
                from: "ratings",
                localField: "userID",
                foreignField: "userID",
                as: "rating"
            }
        }]).exec(function(err, students){
            students.forEach(student=>{
                console.log(student.rating)
            })
        })
        let watchlist = await Watchlist.find({userID: req.body.userID});
        
        watchlist.forEach(async (wl, idx) => {
            URL = `${API2_URL}anime/${wl.animeID}?fields=id,title,main_picture`;
            let anime = await axios.get(URL, {
                headers: {
                    "X-MAL-CLIENT-ID": process.env.CLIENT_ID
                }
            })
            watchlistData.push(
                {
                    "watchlist": wl,
                    "anime": anime.data
                }
            )
            if(idx === watchlist.length - 1){
                setTimeout(() => {
                    res.json(watchlistData);
                }, 500);
            }
        });
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
        if(req.body.userID != null && req.body.animeID != null){
            watchlist = await Watchlist.findOne({userID: req.body.userID, animeID : req.body.animeID})
        } else {
            watchlist = await Watchlist.findById(req.body.id);
        }
        await watchlist.remove();
        res.json({ message: "Successfully Removed from Watchlist !" });
    } catch (error) {
        res.json(error.message);
    }
})

module.exports = router