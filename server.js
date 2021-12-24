require('dotenv').config()

const express = require("express");
const cors = require('cors')
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());


const animeRouter = require("./routes/anime");
app.use('/anime', animeRouter);

app.listen(PORT, () => console.log("Server Started on Port " + PORT))