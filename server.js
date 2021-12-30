require('dotenv').config()


const express = require("express");
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://admin-michael:michaelthe23@cluster0.c9aqh.mongodb.net/Weeblist?retryWrites=true&w=majority", {useNewUrlParser: true});
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', (error) => console.log("Connected to Database"))

app.use(express.json());
app.use(cors());


const animeRouter = require("./routes/anime");
const watchlistRouter = require("./routes/watchlist");
const ratingRouter = require("./routes/rating");

app.use('/anime', animeRouter);
app.use('/watchlist', watchlistRouter);
app.use('/rating', ratingRouter);

app.listen(PORT, () => console.log("Server Started on Port " + PORT))