const User = require("../models/user");
const Room = require("../models/room");
const client = require("../mqtt/connection");
const updateGameStatus = require("../mqtt/updateGameStatus");
const { roomSchema } = require("../schemas.js");

module.exports.renderRoomsList = async (req, res) => {
  const userWaitingRooms = await Room.find({
    guest: null,
    host: req.user._id,
  });
  const userInGameRooms = await Room.find({
    $and: [
      { guest: { $ne: null } },
      { $or: [{ host: req.user._id }, { guest: req.user._id }] },
    ],
  });
  const activeRooms = await Room.find({
    guest: null,
    host: { $ne: req.user._id },
  });
  res.render("rooms/index", {
    activeRooms,
    userWaitingRooms,
    userInGameRooms,
  });
};

module.exports.renderRoomById = async (req, res) => {
  const room = await Room.findById(req.params.id).populate({
    path: "chatMessages",
    populate: {
      path: "author",
    },
  });
  if (!room) {
    req.flash("error", "Room with given id doesn't exists");
    return res.redirect("/rooms");
  }
  if (!(req.user._id.equals(room.host) || req.user._id.equals(room.guest))) {
    req.flash("error", "You don't belong to this room!");
    return res.redirect("/rooms");
  }
  res.render("rooms/gameRoom", { room });
};

module.exports.createRoom = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { error } = roomSchema.validate(req.body);
  if (error) {
    req.flash("error", "You cannot inject code into room name!");
    return res.redirect("/rooms");
  }
  const checkRoomUnique = await Room.findOne({ name: req.body.name });
  if (checkRoomUnique) {
    req.flash("error", "Room with that name already exists");
    return res.redirect("/rooms");
  }
  if (req.body.name.length > 20) {
    req.flash("error", "Room name can contain maximally 20 letters");
    return res.redirect("/rooms");
  }
  const room = new Room({ name: req.body.name, host: user });
  await room.save();
  client.publish("rooms/new", JSON.stringify({ ...room._doc }));
  updateGameStatus(null, `/server/rooms/${room._id}/chat`, null);
  req.flash("success", "Room created");
  res.redirect("/rooms");
};

module.exports.updateRoom = async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room.guest) {
    req.flash("error", "Room is full now!");
    return res.redirect("/rooms");
  }
  if (room.host._id === req.user._id) {
    req.flash("error", "You cannot join to your own room!");
    return res.redirect("/rooms");
  }
  room.guest = req.user._id;
  await room.save();
  client.publish("rooms/patch", JSON.stringify({ ...room._doc }));
  res.redirect("/rooms");
};

module.exports.deleteRoom = async (req, res) => {
  const { id } = req.params;
  const room = await Room.findById(id);
  if (!room.host._id.equals(req.user._id)) {
    req.flash("error", "You must be the room owner!");
    return res.redirect("/rooms");
  }
  await Room.findByIdAndRemove(id);
  client.publish("rooms/delete", JSON.stringify({ _id: id }));
  req.flash("success", "Room successfully deleted.");
  res.redirect("/rooms");
};
