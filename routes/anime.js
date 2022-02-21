require("dotenv").config();

const axios = require("axios");
const express = require("express");
const genres = require("../JSON/genre.json");
const sortBy = require("../JSON/sortBy.json");
const seasons = require("../JSON/season.json");
const carousel = require("../JSON/carousel.json");
const Rating = require("../models/Rating");
const router = express.Router();
const spawn = require("child_process").spawn;

const API_URL = process.env.API_URL;
const API2_URL = process.env.API2_URL;

router.get("/searchQuery", async (req, res) => {
  let URL = `${API2_URL}anime?q=${req.query.q}&limit=10&fields=id,title,main_picture`;

  try {
    let searchData = await axios.get(URL, {
      headers: {
        "X-MAL-CLIENT-ID": process.env.CLIENT_ID,
      },
    });
    res.json(searchData.data.data);
  } catch (error) {
    console.log(error);
  }
});

router.post("/home", async (req, res) => {
  let animeData = {
    carousel: [],
    recommendation: [],
  };

  carousel.forEach((carousel) => {
    animeData.carousel.push(carousel);
  });

  let season =
    seasons[Math.floor(new Date().getMonth() / 3)].season.toLowerCase();
  let year = new Date().getFullYear();
  let URL = `${API2_URL}anime/season/${year}/${season}?limit=20&fields=id,title,media_type,main_picture`;

  try {
    let seasonals = await axios.get(URL, {
      headers: {
        "X-MAL-CLIENT-ID": process.env.CLIENT_ID,
      },
    });
    animeData.seasonal = seasonals.data.data;
  } catch (error) {
    res.json(error);
  }

  let rating;
  try {
    rating = await Rating.findOne({
      userID: req.session.user === undefined ? "" : req.session.user._id,
    });
  } catch (error) {
    res.json(error);
  }

  let recommendation;

  if (!rating) {
    try {
      URL =
        "https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=20&genre_exclude=0&fields=id,title,media_type,main_picture";
      recommendation = await axios.get(URL, {
        headers: {
          "X-MAL-CLIENT-ID": process.env.CLIENT_ID,
        },
      });
      recommendation.data.data.forEach((rec) => {
        animeData.recommendation.push(rec.node);
      });

      setTimeout(() => {
        res.json(animeData);
      }, 500);
    } catch (error) {
      res.json(error);
    }
  } else {
    let payload = {
      userID: rating.userID,
    };

    const py = spawn("python", ["./script/recommend.py"]);
    py.stdout.on("data", (data) => {
      console.log(data.toString());
      let animeID = JSON.parse("[" + data + "]")
        .toString()
        .split(",");
      animeID.forEach(async (id, idx) => {
        try {
          URL = `${API2_URL}anime/${id}?fields=id,title,media_type,main_picture`;
          let anime = await axios.get(URL, {
            headers: {
              "X-MAL-CLIENT-ID": process.env.CLIENT_ID,
            },
          });
          animeData.recommendation.push(anime.data);
          if (idx === animeID.length - 1) {
            setTimeout(() => {
              res.json(animeData);
            }, 500);
          }
        } catch (error) {
          res.json(error);
        }
      });
    });

    py.stdout.on("error", function (err) {
      console.log(err.toString());
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  }
});

router.get("/search", async (req, res) => {
  let URL = API_URL + "/search/anime?q=";
  if (req.query.q) {
    URL += encodeURI(req.query.q);
  } else {
    if (req.query.season) {
      URL = API_URL + "/season/" + req.query.year + "/" + req.query.season;
    } else {
      URL += req.query.genre ? "&genre=" + req.query.genre : "";
      URL +=
        "&order_by=" + (req.query.order_by ? req.query.order_by : "members");
      URL += "&sort=desc";
      URL += req.query.season ? "&season=" + req.query.season : "";
    }
  }
  try {
    let anime;
    if (req.query.season) {
      anime = await axios.get(URL);
      anime = anime.data;
      anime["results"] = anime["anime"];
      delete anime["anime"];
      console.log(anime)
    } else {
      anime = await axios.get(
        URL + "&page=" + req.query.page + "&field=last_page"
      );
      anime = anime.data;
      prevPage = parseInt(req.query.page) - 1;
      nextPage = parseInt(req.query.page) + 1;
      if (prevPage > 0) {
        anime.prevPage = true;
      } else {
        anime.prevPage = false;
      }

      if (nextPage < anime.last_page) {
        anime.nextPage = true;
      } else {
        try {
          data = await axios.get(URL + "&page=" + nextPage + "&limit=1");
          anime.nextPage = true;
        } catch (error) {
          anime.nextPage = false;
        }
      }
    }

    res.json(anime);
  } catch (error) {
    res.json(error);
  }
});

router.get("/genre", (req, res) => {
  res.json(genres);
});

router.get("/sort", (req, res) => {
  res.json(sortBy);
});

router.get("/season", (req, res) => {
  res.json(seasons);
});

router.get("/:id", async (req, res) => {
  let animeData;

  let id = req.params.id;
  let URL = API_URL + "/anime/" + id;
  try {
    anime = await axios.get(URL);
    animeData = anime.data;
  } catch (error) {
    res.json(error);
  }

  let characters;
  URL += "/characters_staff";

  try {
    characters = await axios.get(URL);
    animeData.characters = characters.data.characters;
  } catch (error) {
    res.json(error);
  }

  let recommendations = [];
  URL = `${API2_URL}anime/${id}?fields=recommendations`;
  try {
    let anime = await axios.get(URL, {
      headers: {
        "X-MAL-CLIENT-ID": process.env.CLIENT_ID,
      },
    });

    anime.data.recommendations.forEach((anime) => {
      recommendations.push(anime.node);
    });
    animeData.recommendations = recommendations;
    res.json(animeData);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
