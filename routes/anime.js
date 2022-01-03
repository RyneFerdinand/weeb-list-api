require("dotenv").config()

const axios = require("axios")
const express = require("express");
const genres = require('../JSON/genre.json');
const sortBy = require('../JSON/sortBy.json');
const seasons = require('../JSON/season.json');
const carousel = require('../JSON/carousel.json');
const { json } = require("express/lib/response");
const Rating = require("../models/Rating");
const router = express.Router()

const API_URL = process.env.API_URL
const API2_URL = process.env.API2_URL

router.post('/home', async (req, res) => {
    let animeData = {
        carousel: [],
        recommendation: []
    };

    carousel.forEach(carousel=>{
        animeData.carousel.push(carousel);
    })

    let season = seasons[Math.floor(new Date().getMonth() / 3)].season.toLowerCase();
    let year = new Date().getFullYear();
    let URL = `${API2_URL}anime/season/${year}/${season}?limit=10`;

    try {
        let seasonals = await axios.get(URL, {
            headers:{
                "X-MAL-CLIENT-ID": process.env.CLIENT_ID
            }
        })
        animeData.seasonal = seasonals.data.data;
    } catch (error) {
        res.json(error.message);
    }
    
    let rating;
    try {
      rating = await Rating.findOne({
        userID: req.body.userID
      });
      console.log(rating);
    } catch (error) {
      res.json(error.message);
    }

    let recommendation;

    if(! rating){
        try {
            URL = 'https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=10'
            recommendation = await axios.get(URL, {
                headers:{
                    "X-MAL-CLIENT-ID": process.env.CLIENT_ID
                }
            })
        } catch (error) {
            res.json(error)
        }
    } else {
        
    }

    let animeID = [2904, 39486, 35180, 4181, 32935, 1, 33050, 37521, 40748, 3786];
    animeID.forEach(async (id, idx)=>{
        try {
            URL = `${API2_URL}anime/${id}?fields=id,title,main_picture`
            let anime = await axios.get(URL, {
                headers: {
                    "X-MAL-CLIENT-ID": process.env.CLIENT_ID
                }
            })
            animeData.recommendation.push(anime.data);
            if(idx === animeID.length - 1){
                setTimeout(() => {
                    res.json(animeData)
                }, 500);
            }

        } catch (error) {
            res.json(error.message);
        }
    })
})

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

    try {
        let anime = await axios.get(URL);

        anime = anime.data;
        if(req.query.season){
            anime["results"] = anime["anime"];
            delete anime["anime"];
        }
        res.json(anime);
    } catch (error) {
        res.json(error.message);
        
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
        anime = await axios.get(URL);
        animeData = anime.data;
    } catch (error) {
        res.json(error.message)
    }
    
    let characters;
    URL += "/characters_staff"
    
    try {
        characters = await axios.get(URL);
        animeData.characters = characters.data.characters;
    } catch (error) {
        res.json(error.message)
    }
    
    let recommendations;
    URL = API_URL + "/anime/" + id + "/recommendations"
    try {
        recommendations = await axios.get(URL);
        animeData.recommendations = recommendations.data.recommendations;
        res.json(animeData);
    } catch (error) {
        res.json(error.message)
    }
})

module.exports = router