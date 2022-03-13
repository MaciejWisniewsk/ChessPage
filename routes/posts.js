const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const posts = require("../controllers/posts");
const { isLoggedIn, isPostAuthor } = require("../middleware");

router
  .route("/")
  .get(catchAsync(posts.renderPostsList))
  .post(isLoggedIn, catchAsync(posts.createPost));

router
  .route("/:id")
  .get(catchAsync(posts.renderPostById))
  .put(isLoggedIn, isPostAuthor, catchAsync(posts.updatePost))
  .delete(isLoggedIn, isPostAuthor, catchAsync(posts.deletePost));

module.exports = router;
