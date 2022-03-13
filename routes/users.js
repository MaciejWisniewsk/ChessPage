const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegisterForm)
  .post(catchAsync(users.createUser));

router
  .route("/login")
  .get(users.renderLoginForm)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.loginUser
  );

router.get("/logout", users.logoutUser);

router.get("/profile", isLoggedIn, users.renderUserProfile);

router
  .route("/changePassword")
  .get(isLoggedIn, users.renderChangePasswordForm)
  .patch(isLoggedIn, catchAsync(users.changePassword));

router.delete("/deleteAccount", isLoggedIn, catchAsync(users.deleteUser));

router.get("/ranking", catchAsync(users.renderUsersRanking));

router.get("/ranking/byPattern", catchAsync(users.getUsersRankingByPattern));

module.exports = router;
