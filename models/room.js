const mongoose = require("mongoose");
const { Schema } = mongoose;
const ChatMessage = require("./chatMessage");

const roomSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    maxLength: 20,
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  chatMessages: [
    {
      type: Schema.Types.ObjectId,
      ref: "ChatMessage",
    },
  ],
  gameFen: {
    type: String,
  },
});

roomSchema.post("findOneAndRemove", async (doc) => {
  if (doc) {
    console.log(doc);
    await ChatMessage.deleteMany({
      _id: {
        $in: doc.chatMessages,
      },
    });
  }
});

module.exports = mongoose.model("Room", roomSchema);
