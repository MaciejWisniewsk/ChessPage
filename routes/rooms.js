const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn } = require("../middleware");
const rooms = require("../controllers/rooms");

router
  .route("/")
  .get(isLoggedIn, catchAsync(rooms.renderRoomsList))
  .post(isLoggedIn, catchAsync(rooms.createRoom));

router
  .route("/:id")
  .get(isLoggedIn, catchAsync(rooms.renderRoomById))
  .patch(isLoggedIn, catchAsync(rooms.updateRoom))
  .delete(isLoggedIn, catchAsync(rooms.deleteRoom));

module.exports = router;
