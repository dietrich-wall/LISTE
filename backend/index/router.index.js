const router = require("express").Router();
const checkAuthentication = require("../middleware/authentication");

// Main Route either renders the landing-page with login/signup form
// or redirects to the user dashboard
router.route("/").get(checkAuthentication, (req, res) => {
  res.redirect("/user/" + req.user._id);
});

module.exports = router;
