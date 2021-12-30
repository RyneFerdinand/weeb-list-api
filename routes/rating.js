require("dotenv").config()

const axios = require("axios")
const express = require("express");
const { json } = require("express/lib/response");
const router = express.Router()
const Rating = require("../models/Rating")

router.post('/view', async(req, res) => {
    let rating;
    try {
        rating = await Rating.find({animeID: req.body.animeID});
        res.json(rating);
    } catch (error) {
        res.json(error.message);
    }
    
})

router.post('/add', async(req, res) => {
    let rating = new Rating({
        userID: req.body.userID,
        animeID: req.body.animeID,
        description: req.body.description,
        rating: req.body.rating
    });

    try {
        const newRating = await rating.save();
        res.json(newRating);
    } catch (error) {
        res.json(error.message);
    }
})

router.patch('/update', async(req, res) => {
    let rating;
    try {
        rating = await Rating.findById(req.body.id);
        if(req.body.description != null){
            rating.description = req.body.description;
        }

        if(req.body.rating != null){
            rating.rating = req.body.rating;
        }
        
        let updatedRating = await rating.save();
        res.json(updatedRating);
    } catch (error) {
        res.json(error.message);
    }
})

router.delete('/delete', async(req, res) => {
    let rating;
    try {
        rating = await Rating.findById(req.body.id);
        await rating.remove();
        res.json({ message: "Successfully Removed Rating !" });
    } catch (error) {
        res.json(error.message);
    }
})

router.post('/search', async(req, res) => {
    let rating;
    try {
        rating = await Rating.findOne({userID: req.body.userID, animeID: req.body.animeID});
        res.json(rating);
    } catch (error) {
        res.json(error.message);
    } 
})

module.exports = router