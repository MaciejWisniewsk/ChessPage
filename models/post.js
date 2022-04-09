const mongoose = require("mongoose");
const { Schema } = mongoose;
const Comment = require("./comment");

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxlength: 40,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

postSchema.post("findOneAndRemove", async function (doc) {
  if (doc) {
    await Comment.deleteMany({
      _id: {
        $in: doc.comments,
      },
    });
  }
});

module.exports = mongoose.model("Post", postSchema);
