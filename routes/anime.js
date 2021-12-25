require("dotenv").config()

const axios = require("axios")
const express = require("express");
const genres = require('../genre.json');
const router = express.Router()

const API_URL = process.env.API_URL
const CLIENT_ID = process.env.CLIENT_ID

router.get('/genre', async (req, res) => {
    res.json(genres);
})

router.get('/:id', async (req, res)=>{
    let id = req.params.id
    let URL = API_URL + "/anime/" + id;
    
    let animeData;

    try {
        animeData = await axios.get(URL);
    } catch (error) {
        res.json(error.message)
    }

    let characters;
    URL += "/characters_staff"
    try {
        characters = await axios.get(URL);
        animeData.data.characters = characters.data.characters;;
        res.json(animeData.data);
    } catch (error) {
        res.json(error.message)
    }
})



router.get('/season', async(req, res) => {
    console.log("Test")
})



router.get('/top/:page', async (req, res)=>{
    let page = req.params.page
    let URL = API_URL + "/top/anime/" + page

    console.log(URL)
    try {
        const anime = await axios.get(URL);
        res.json(anime.data)
    } catch (error) {
        res.json(error.message)
    }
})

module.exports = router