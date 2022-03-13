const User = require("../models/user");

const rank = async (id) => {
  const user = await User.findById(id);
  const result = await User.aggregate()
    .match({ points: { $gt: user.points } })
    .group({ _id: 0, count: { $sum: 1 } });
  return result[0] ? result[0].count + 1 : 1;
};

const ranking = async (users) => {
  return await Promise.all(
    users.map(async (record) => {
      const { username, points, _id } = record._doc;
      const rank_number = await rank(_id);
      return { username, points, rank_number };
    })
  );
};

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.createUser = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username, points: 0 });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Chess Page!");
      res.redirect("/");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
  req.logout();
  req.flash("success", "Goodbye!");
  res.redirect("/");
};

module.exports.changePassword = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, newPassword } = req.body;
  user.changePassword(oldPassword, newPassword, (err) => {
    if (err) {
      if (err.name === "IncorrectPasswordError") {
        req.flash("error", "Incorrect password!");
      } else {
        req.flash("Something went wrong!");
      }
      return res.redirect("profile");
    }
    req.flash("success", "Password changed successfully");
    res.redirect("profile");
  });
};

module.exports.renderUserProfile = (req, res) => {
  res.render("users/profile");
};

module.exports.renderChangePasswordForm = (req, res) => {
  res.render("users/passwordChangeForm");
};

module.exports.deleteUser = async (req, res) => {
  await User.deleteOne({ _id: req.user._id });
  req.flash("success", "Account Deleted");
  req.logout();
  res.redirect("/");
};

module.exports.renderUsersRanking = async (req, res) => {
  const users = await User.find().sort({ points: -1 }).limit(50);
  const ranked_users = await ranking(users);
  res.render("users/ranking", { ranking: ranked_users });
};

module.exports.getUsersRankingByPattern = async (req, res) => {
  const { pattern } = req.query;
  const users = await User.find({
    username: { $regex: pattern },
  })
    .sort({ points: -1 })
    .limit(50);
  const ranked_users = await ranking(users);
  res.send(ranked_users);
};
