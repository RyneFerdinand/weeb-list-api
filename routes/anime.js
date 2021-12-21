require("dotenv").config()

const axios = require("axios")
const express = require("express");
const router = express.Router()
const API_URL = process.env.API_URL

router.get('/:id', async (req, res)=>{
    let URL = "https://weeb-list-api.herokuapp.com/anime/38671"
    // let URL = `${API_URL}${req.baseUrl}/${req.params.id}`
    try {
        const anime = await axios.get(URL);
        res.json(anime.data)
    } catch (error) {
        res.json(error.message)
    }
})

module.exports = router