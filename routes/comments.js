const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const comments = require("../controllers/comments");
const { isLoggedIn, isCommentAuthor } = require("../middleware");

router.post("/", isLoggedIn, catchAsync(comments.createComment));

router
  .route("/:commentId")
  .delete(isLoggedIn, isCommentAuthor, catchAsync(comments.deleteComment))
  .get(catchAsync(comments.getComment))
  .put(isLoggedIn, isCommentAuthor, catchAsync(comments.updateComment));

module.exports = router;
