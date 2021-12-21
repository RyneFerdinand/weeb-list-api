require('dotenv').config()

const express = require("express");
const app = express();

app.use(express.json());

const animeRouter = require("./routes/anime");
app.use('/anime', animeRouter);

app.listen(3000, () => console.log("Server Started on Port 3000"))