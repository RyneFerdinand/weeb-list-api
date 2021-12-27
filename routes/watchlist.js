require("dotenv").config()

const axios = require("axios")
const express = require("express");
const { json } = require("express/lib/response");
const router = express.Router()

router.get('/', async (req, res) => {
    let animeList = [];

    home.forEach(anime=>{
        animeList.push(anime.anime);
    })
    res.json(animeList);
})
