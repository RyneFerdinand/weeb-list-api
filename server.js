require('dotenv').config()


const express = require("express");
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require('mongoose')

const bodyParser = require("body-parser");
const session = require('express-session');
const cookieParser = require("cookie-parser");

mongoose.connect("mongodb+srv://admin-michael:michaelthe23@cluster0.c9aqh.mongodb.net/Weeblist?retryWrites=true&w=majority", {useNewUrlParser: true});
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', (error) => console.log("Connected to Database"))

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
}));
app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.use(session({
    key: "userId",
    secret: "subscribe",
    resave: false,
    saveUninitialized: false,
    expires: new Date(Date.now() + (30 * 86400 * 1000)) 
}))

const animeRouter = require("./routes/anime");
const watchlistRouter = require("./routes/watchlist");
const ratingRouter = require("./routes/rating");
const userRouter = require("./routes/user");

app.use('/anime', animeRouter);
app.use('/watchlist', watchlistRouter);
app.use('/rating', ratingRouter);
app.use('/', userRouter);

app.listen(PORT, () => console.log("Server Started on Port " + PORT))