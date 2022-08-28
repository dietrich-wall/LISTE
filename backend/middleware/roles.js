// Role based permission middleware
module.exports = function permit(...permittedRoles) {
  // return middleware
  return (req, res, next) => {
    // get user from request object
    const { user } = req;
    // check if user role matched authorized roles
    if (user && permittedRoles.includes(user.role)) {
      // assign user data to response object
      res.locals.user = { _id: user._id, role: user.role };
      // role is allowed, continue to the next middleware
      return next();
    }
    // setup "permission denied" flash message
    req.flash(
      "error",
      "Zugangsberechtigung als <strong>" +
        user.role +
        "</strong> nicht ausreichend"
    );
    // redirect to landingpage / user dashboard if authorization failed
    res.redirect("/");
  };
};
