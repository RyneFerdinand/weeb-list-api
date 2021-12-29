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

module.exports = router