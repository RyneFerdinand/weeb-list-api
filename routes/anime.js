require("dotenv").config()

const axios = require("axios")
const express = require("express");
const genres = require('../JSON/genre.json');
const sortBy = require('../JSON/sortBy.json');
const seasons = require('../JSON/season.json');
const router = express.Router()

const API_URL = process.env.API_URL
const CLIENT_ID = process.env.CLIENT_ID

router.get('/search', async (req, res) => {
    let URL = API_URL + "/search/anime?q="; 
    if(req.query.q){
        URL += encodeURI(req.query.q);
        URL += "&page=1";
    } else {
        if(req.query.season){
            URL = API_URL +  "/season/" + req.query.year + "/" + req.query.season;
        } else {
            URL += (req.query.genre ? "&genre=" + req.query.genre : "")
            URL += "&order_by=" + (req.query.order_by ? req.query.order_by : "members");
            URL += "&sort=desc";
            URL += "&limit=" + (req.query.limit ? req.query.limit : 50);
            URL += (req.query.season ? "&season=" + req.query.season : "");
        }
    }

    console.log(URL)
    try {
        let anime = await axios.get(URL);

        anime = anime.data;
        if(req.query.season){
            anime["results"] = anime["anime"];
            delete anime["anime"];
        }
        
        res.json(anime);
    } catch (error) {
        res.json(error.message)
        
    }
})

router.get('/genre', (req, res) => {
    res.json(genres);
})

router.get('/sort', (req, res) => {
    res.json(sortBy);
})

router.get('/season', (req, res) => {
    res.json(seasons);
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

module.exports = router