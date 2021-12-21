require('dotenv').config()

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const animeRouter = require("./routes/anime");
app.use('/anime', animeRouter);

app.listen(PORT, () => console.log("Server Started on Port " + PORT))