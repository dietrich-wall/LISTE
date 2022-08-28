// Authentication middleware
module.exports = function checkAuthentication(req, res, next) {
  // procced if authentication with passport is successful
  if (req.isAuthenticated()) {
    return next();
  }
  // render landingpage without navbar if authentication failes
  res.render("landingpage", {
    success: req.flash("success"),
    error: req.flash("error"),
    layout: "layouts/userNotLogged",
  });
};
