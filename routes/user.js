const express = require("express");
const Rating = require("../models/Rating");
const router = express.Router();
const User = require("../models/User");
const Watchlist = require("../models/Watchlist");
const bcrypt = require("bcrypt");

router.get("/login", (req, res) => {
  if (req.session.user) {
    console.log(req.session);
    res.send({ loggedIn: true });
  } else {
    res.send({ loggedIn: false });
  }
});

let month = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

router.get("/id", (req, res) => {
  res.send(req.session.user._id);
});

router.post("/register", (req, res) => {
  let date = new Date();
  date =
    date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear();
  let name = req.body.name;
  let username = req.body.username;
  let password = req.body.password;
  let email = req.body.email;
  let checkbox = req.body.checkbox;
  let unique = true;
  User.findOne({ username: username }, function (err, foundUser) {
    if (err || foundUser) {
      unique = false;
    }
  });

  if (
    name.length == 0 ||
    username.length == 0 ||
    password.length == 0 ||
    email.length == 0
  ) {
    res.send({ message: "All data must be inputted" });
  } else if (password.length < 8) {
    res.send({ message: "Password must be more than 8 characters" });
  } else if (!unique) {
    res.send({ message: "Username must be unique" });
  } else if (!email.includes("@")) {
    res.send({ message: "Email must contain @ character" });
  } else if (!checkbox) {
    res.send({ message: "Checkbox must be ticked" });
  } else {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        res.send({ registeredIn: false, message: "Register unsuccessful" });
      } else {
        const newUser = new User({
          name: name,
          username: username,
          email: email,
          password: hash,
          gender: "-",
          joined: date,
          profileImage: "https://picsum.photos/200/300",
        });
        newUser.save(function (err) {
          if (err) {
            res.send({ registeredIn: false, message: "Register unsuccessful" });
          } else {
            res.send({ registeredIn: true, message: "Register successful" });
          }
        });
      }
    });
  }
});

router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username.length == 0 || password.length == 0) {
    res.send({ message: "All data must be inputted" });
  } else {
    User.findOne({ username: username }, function (err, foundUser) {
      console.log(foundUser);
      if (err) {
        res.send({ loggedIn: false, message: "Login unsuccessful" });
      } else {
        if (foundUser) {
          bcrypt.compare(password, foundUser.password, function (err, result) {
            if (!err && result === true) {
              req.session.user = foundUser;
              res.send({
                UID: foundUser._id.toString(),
                loggedIn: true,
                message: "Login successful",
              });
            } else {
              res.send({ loggedIn: false, message: "Login unsuccessful" });
            }
          });
        } else {
          res.send({ loggedIn: false, message: "Login unsuccessful" });
        }
      }
    });
  }
});

router.post("/updateprofile", (req, res) => {
  User.findOne({ username: req.session.user.username }, (err, foundUser) => {
    if (!err && foundUser) {
      let unique = true;
      User.findOne({ username: req.body.username }, (err, foundUser) => {
        if (!err && foundUser) {
          unique = false;
        }
      });
      if (
        unique ||
        (!unique && req.session.user.username === req.body.username)
      ) {
        foundUser.name = req.body.name;
        foundUser.email = req.body.email;
        foundUser.username = req.body.username;
        if (req.body.gender === "female bg-dark") {
          foundUser.gender = "Female";
        } else if (req.body.gender === "male bg-dark") {
          foundUser.gender = "Male";
        } else {
          foundUser.gender = "-";
        }
        foundUser.save(function (err) {
          if (err) {
            res.send({ message: "Update unsuccessful" });
          } else {
            req.session.user = foundUser;
            res.send({ message: "Update successful" });
          }
        });
      } else {
        res.send({ message: "Username must be unique" });
      }
    } else {
      res.send({ message: "Update unsuccessful" });
    }
  });
});

router.get("/updateprofile", (req, res) => {
  User.findOne({ username: req.session.user.username }, (err, foundUser) => {
    if (!err && foundUser) {
      res.send({
        name: foundUser.name,
        email: foundUser.email,
        username: foundUser.username,
        gender: foundUser.gender,
        profileImage: foundUser.profileImage,
      });
    }
  });
});

router.post("/changepassword", (req, res) => {
  let newPassword = req.body.newPassword;
  let oldPassword = req.body.oldPassword;
  let confirmPassword = req.body.confirmPassword;

  if (
    newPassword.length < 8 ||
    confirmPassword.length < 8 ||
    oldPassword.length < 8
  ) {
    res.send({
      message: "The password inputted must be more than 8 characters",
    });
  } else {
    User.findOne({ username: req.session.user.username }, (err, foundUser) => {
      if (!err && foundUser) {
        if (req.body.newPassword === req.body.confirmPassword) {
          bcrypt.compare(
            req.body.oldPassword,
            foundUser.password,
            function (err, result) {
              if (!err && result === true) {
                bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
                  if (err) {
                    res.send({
                      changePassword: false,
                      message: "Change password successful",
                    });
                  } else {
                    foundUser.password = hash;
                    foundUser.save(function (err) {
                      if (err) {
                        res.send({ message: "Change password unsuccessful" });
                      } else {
                        req.session.user = foundUser;
                        res.send({ message: "Change password successful" });
                      }
                    });
                  }
                });
              } else {
                res.send({ message: "Change password unsuccessful" });
              }
            }
          );
        } else {
          res.send({
            message: "New Password and Confirm Password must be the same",
          });
        }
      } else {
        res.send({ message: "Update unsuccessful" });
      }
    });
  }
});

router.get("/getprofile", (req, res) => {
  if (!req.session.user) {
    res.send({ message: "You need to login first" });
  } else {
    res.send({
      name: req.session.user.name,
      username: req.session.user.username,
      gender: req.session.user.gender,
      joined: req.session.user.joined,
      profileImage: req.session.user.profileImage,
    });
  }
});

router.get("/dashboard", async (req, res) => {


  let watchlist = -1;
    finished = -1,
    watching = -1,
    planned = -1,
    review = -1;
  Watchlist.find({ userID: req.session.user._id }, (err, foundWatchlist) => {
    console.log(foundWatchlist)
    if (!err && foundWatchlist) {
      watchlist = foundWatchlist.length;
      console.log(watchlist);
    }
  });
  Watchlist.find(
    { userID: req.session.user._id, status: "Finished" },
    (err, foundWatchlist) => {
      if (!err && foundWatchlist) {
        finished = foundWatchlist.length;
      }
    }
  );
  Watchlist.find(
    { userID: req.session.user._id, status: "Watching" },
    (err, foundWatchlist) => {
      if (!err && foundWatchlist) {
        watching = foundWatchlist.length;
      }
    }
  );
  Watchlist.find(
    { userID: req.session.user._id, status: "Planned" },
    (err, foundWatchlist) => {
      if (!err && foundWatchlist) {
        planned = foundWatchlist.length;
      }
    }
  );
  Rating.find({ userID: req.session.user._id }, (err, foundRating) => {
    if (!err && foundRating) {
      review = foundRating.length;
    }
  });
  setTimeout(() => {
    res.send({
      watchlist: watchlist,
      finished: finished,
      watching: watching,
      planned: planned,
      review: review,
    });
  }, 800);
});

router.post("/changeimage", (req, res) => {
  User.findById(req.session.user._id, (err, foundUser) => {
    if (!err && foundUser) {
      foundUser.profileImage = req.body.profileImage;
      foundUser.save((err) => {
        if (err) {
          res.send({ message: "Change image unsucessful" });
        } else {
          res.send({ message: "Change image sucessful" });
        }
      });
    } else {
      res.send({ message: "Change image unsucessful" });
    }
  });
});

module.exports = router;