exports.showHomePage = (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student !== "undefined") {
    return res.redirect("student/dashboard");
  }
  res.render("home");
};
