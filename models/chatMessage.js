const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema({
  text: {
    type: String,
    required: true,
    minlength: 1,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  isBot: Boolean,
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
