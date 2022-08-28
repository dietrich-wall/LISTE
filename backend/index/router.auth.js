const express = require("express");
const router = express.Router();
// DB manipulation functions
const UserController = require("../resources/user/controller.user");
// authentication middleware
const passport = require("passport");
// Input data validation and sanitization
const {
  validateUserData,
  validatePassword,
} = require("../middleware/validation");
// mailing function
const sendEmail = require("../utils/emails");
// cryptography functions
const crypto = require("../utils/cryptography");

/**
 * These routes take care of the signup / registration process
 *
 * Route: /signup
 * POST: Generate confirmation link, mail link to user
 *
 * Route: /confirm/:id
 * GET: signup data from URL and create user
 *
 */
router.post(
  "/signup",
  validateUserData,
  validatePassword,
  async (req, res, next) => {
    // check if user already exists
    if (await UserController.findByEmail(req, res)) {
      req.flash("error", "Email Adresse ist bereits Registriert");
      return res.redirect("/");
    }
    // hash user password
    req.body.password = await crypto.encryptPassword(req.body.password);
    // add todays date to req.body and encrypt signup data
    req.body.today = crypto.today();
    let hash = crypto.encrypt(JSON.stringify(req.body));
    // generate confirmation endpoint with current day and hash
    let endpoint = req.body.today + "-" + JSON.stringify(hash);
    // fix link
    let fixedEndpoint = endpoint.replace(/\"/g, "&quot;");
    // send Email with confirmation link
    sendEmail
      .registration(req.body.email, endpoint, fixedEndpoint)
      .catch(console.error);
    req.flash("success", "Bitte folgen Sie dem Bestätigungs-Link in der Email");
    res.redirect("/");
  }
);

// User account confirmation route
router.get("/confirm/:today-:hash", async (req, res) => {
  // decrypt, parse(string to object) and assigne signup data hidden in hash to req.body object
  req.body = JSON.parse(crypto.decrypt(JSON.parse(req.params.hash)));
  // check if account exists (prevent multiple signups with same link)
  if (await UserController.findByEmail(req, res)) {
    req.flash("error", "Email Adresse ist bereits Regestriert");
    return res.redirect("/");
  }
  // compare dates and exit confirmation process if link is older than one day
  if (req.params.today != crypto.today() && crypto.today() != req.body.today) {
    req.flash("error", "Regestrierungs-Link abgelaufen");
    return res.redirect("/");
  }
  // create user
  const user = await UserController.crud.createOne(req, res);
  req.flash(
    "success",
    "Die Regestrierung für " + user.email + " war erfolgreich"
  );
  res.redirect("/");
});

/**
 * These routes take care of the login and logout process
 *
 * Route: /login
 * POST: authenicate user with @passport, set session according to user selection
 *
 * Route: /logout
 * POST: call @passport function to destroy session data
 *
 */
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/",
    failureFlash: true,
  }),
  (req, res) => {
    // keep session if user check "stay-logged-in" box
    if (req.body.rememberUser != "undefined") {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // Expires in 1 day
    } else {
      req.session.cookie.expires = true;
    }
    res.redirect("back");
  }
);

router.post("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

/**
 * These routes take care of the password reset
 *
 * Route: /password-change-request
 * POST: Find user by email, generate reset link, mail link to user
 *
 * Route: /password-change-request/:today-:hash
 * GET: Render password reset FORM
 *
 * Route: /password-reset
 * POST: encrypt new password and update DB
 *
 */

router.post("/password-change-request", async function (req, res) {
  // find user
  const user = await UserController.findByEmail(req, res);
  if (!user) {
    req.flash("error", "Benutzer nicht gefunden");
    return res.redirect("/");
  }
  // combine user id and date into a onject and encrypt
  let obj = { id: user._id, today: crypto.today() };
  let hash = crypto.encrypt(JSON.stringify(obj));
  // generate password reset endpoint with current day and hashed user id
  let endpoint = crypto.today() + "-" + JSON.stringify(hash);
  // send Email with password reset link
  sendEmail.passwordChange(req.body.email, endpoint).catch(console.error);
  // setup flash message
  let msg = "Reset Link an " + req.body.email + " verschickt";
  req.flash("success", msg);
  res.redirect("/");
});

router
  .route("/password-reset/:today-:hash")

  .get(function (req, res) {
    res.render("partials/auth/reset.ejs", {
      params: req.params,
      layout: "layouts/userNotLogged",
    });
  })

  .post(validatePassword, async function (req, res) {
    // decrypt, parse(string to object) and retrive hashed user id and creation date
    let obj = JSON.parse(crypto.decrypt(JSON.parse(req.params.hash)));
    // compare dates and exit confirmation process if link is older than one day
    if (req.params.today != crypto.today() && crypto.today() != obj.today) {
      req.flash("error", "Passwort-Reset-Link abgelaufen");
      return res.redirect("/");
    }
    // hash user password
    const newHash = await crypto.encryptPassword(req.body.password);
    // update new password hash to DB
    await UserController.changePassword(obj.id, newHash);
    // setup flash message
    req.flash("success", "Passwort erfolgreich zurückgesetzt");
    res.redirect("/");
  });

module.exports = router;
