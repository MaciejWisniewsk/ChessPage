const User = require("../models/user");
const Post = require("../models/post");

module.exports.renderPostsList = async (req, res) => {
  const posts = await Post.find().populate("author");
  res.render("posts/index", { posts });
};

module.exports.renderPostById = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id)
    .populate({
      path: "comments",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!post) {
    req.flash("error", "Post with given id doesn't exists");
    return res.redirect("/posts");
  }
  res.render(`posts/details`, { post });
};

module.exports.updatePost = async (req, res) => {
  const { id } = req.params;
  if (req.body.title.length > 40) {
    req.flash("error", "Title can contain maximally 40 characters");
    return res.redirect(`/posts/${id}`);
  }
  await Post.findByIdAndUpdate(id, req.body);
  res.redirect(`/posts/${id}`);
};

module.exports.deletePost = async (req, res) => {
  await Post.findByIdAndRemove(req.params.id);
  req.flash("success", "Post deleted");
  res.redirect("/posts");
};

module.exports.createPost = async (req, res) => {
  if (req.body.title.length > 40) {
    req.flash("error", "Title can contain maximally 40 characters");
    return res.redirect("/posts");
  }
  const user = await User.findById(req.user._id);
  const post = new Post({ ...req.body, author: user });
  await post.save();
  res.redirect(`/posts/${post._id}`);
};
