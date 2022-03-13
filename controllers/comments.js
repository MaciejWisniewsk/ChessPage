const Post = require("../models/post");
const Comment = require("../models/comment");

module.exports.createComment = async (req, res) => {
  const post = await Post.findById(req.params.id);
  const comment = new Comment(req.body);
  comment.author = req.user._id;
  post.comments.push(comment);
  await comment.save();
  await post.save();
  res.redirect(`/posts/${post._id}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  await Post.findByIdAndUpdate(id, { $pull: { comments: commentId } });
  await Comment.findByIdAndDelete(commentId);
  req.flash("success", "Successfully deleted comment");
  res.redirect(`/posts/${id}`);
};

module.exports.getComment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  res.send(comment);
};

module.exports.updateComment = async (req, res) => {
  const { id, commentId } = req.params;
  await Comment.findByIdAndUpdate(commentId, req.body);
  res.redirect(`/posts/${id}`);
};
