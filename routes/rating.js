require("dotenv").config();

const spawn = require("child_process").spawn;
const express = require("express");
const router = express.Router();
const Rating = require("../models/Rating");
const retrainModel = require("../utility/train");

router.post("/view", async (req, res) => {
  let rating;
  try {
    rating = await Rating.find({ animeID: req.body.animeID });
    res.json(rating);
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/add", async (req, res) => {
  let newRating;
  let rating = new Rating({
    userID: req.body.userID,
    animeID: req.body.animeID,
    description: req.body.description,
    rating: req.body.rating,
  });

  try {
    newRating = await rating.save();

    let payload = {
      userID: req.body.userID,
      animeID: req.body.animeID,
      rating: req.body.rating,
    };

    const py = spawn("python", ["./script/updateRating.py", 1]);
    py.stdout.on("data", (data) => {
      retrainModel();
      console.log(data.toString());
    });
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    res.json(rating);
  } catch (error) {
    res.json(error.message);
  }
});

router.patch("/update", async (req, res) => {
  let rating;
  try {
    rating = await Rating.findById(req.body.id);
    if (req.body.description != null) {
      rating.description = req.body.description;
    }

    if (req.body.rating != null) {
      rating.rating = req.body.rating;
    }

    let payload = {
      userID: rating.userID,
      animeID: rating.animeID,
      rating: rating.rating,
    };

    let updatedRating = await rating.save();
    const py = spawn("python", ["./script/updateRating.py", 3]);

    py.stdout.on("data", (data) => {
      retrainModel();
      console.log(data.toString());
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    setTimeout(() => {
      res.json(updatedRating);
    }, 500);
  } catch (error) {
    res.json(error.message);
  }
});

router.delete("/delete", async (req, res) => {
  let rating;
  try {
    rating = await Rating.findById(req.body.id);
    await rating.remove();

    let payload = {
      userID: rating.userID,
      animeID: rating.animeID,
    };
    const py = spawn("python", ["./script/updateRating.py", 2]);

    py.stdout.on("data", (data) => {
      retrainModel();
      console.log(data.toString());
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();

    res.json({ message: "Successfully Removed Rating !" });
  } catch (error) {
    res.json(error.message);
  }
});

router.post("/search", async (req, res) => {
  let rating;
  try {
    rating = await Rating.findOne({
      userID: req.body.userID,
      animeID: req.body.animeID,
    });
    res.json(rating);
  } catch (error) {
    res.json(error.message);
  }
});

module.exports = router;
