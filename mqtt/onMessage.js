const client = require("./connection");
const Room = require("../models/room");
const User = require("../models/user");
const ChatMessage = require("../models/chatMessage");
const { chatMessageSchema } = require("../schemas.js");
const { Chess } = require("chess.js");
const updateGameStatus = require("./updateGameStatus");

client.on("message", async function (topic, message) {
  if (topic.match(/^\/server\/rooms\/[^/]*\/chat$/)) {
    const room_id = topic.split("/")[3];
    const { _id, username, text } = JSON.parse(message.toString());
    const { error } = chatMessageSchema.validate({ text });
    const room = await Room.findById(room_id);
    const roomTopic = `/rooms/${room._id}/chat`;
    if (error) {
      client.publish(
        roomTopic,
        JSON.stringify({ _id, username, text: "User tried to inject code!" })
      );
    } else {
      const chatMessage = new ChatMessage({ text, author: _id });
      room.chatMessages.push(chatMessage);
      await chatMessage.save();
      await room.save();
      console.log(room);
      client.publish(roomTopic, JSON.stringify({ _id, username, text }));
    }
  } else if (topic.match(/^\/server\/rooms\/[^/]*\/game\/move$/)) {
    const room_id = topic.split("/")[3];
    const { move } = JSON.parse(message.toString());
    const room = await Room.findById(room_id);
    const game = new Chess();
    room.gameFen && game.load(room.gameFen);
    game.move(move);
    room.gameFen = game.fen();
    await room.save();
    client.publish(`/rooms/${room._id}/game/move`, message.toString());
    updateGameStatus(
      game,
      `/server/rooms/${room_id}/chat`,
      `/server/rooms/${room_id}/game/over`,
      room.host,
      room.guest
    );
  } else if (topic.match(/^\/server\/rooms\/[^/]*\/game\/over$/)) {
    const room_id = topic.split("/")[3];
    const room = await Room.findById(room_id);
    const { winner_id, surrender } = JSON.parse(message.toString());
    const game = new Chess();
    room.gameFen && game.load(room.gameFen);
    if (!game.game_over() && !surrender) return;
    if (winner_id) {
      const loser_id = room.host.equals(winner_id) ? room.guest : room.host;
      const winner = await User.findById(winner_id);
      const loser = await User.findById(loser_id);
      winner.points += 1;
      loser.points ? (loser.points -= 1) : {};
      await winner.save();
      await loser.save();
    }
    client.publish(`/rooms/${room_id}/game/over`, message.toString());
    await room.remove();
  }
});
