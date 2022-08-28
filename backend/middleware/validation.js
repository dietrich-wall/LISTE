/**
 * This module exports Arrays of Validation and Sanitization Chains
 *
 * The Chain checks the @constant body of the HTTP request
 * The Validation Result gets added to the @constant { req } Object
 *
 * The Validation Result can be accessed in a callback function
 * Failed Validation returns an Array with error messages
 *
 * @param returns []
 */

const { body, validationResult } = require("express-validator");

// message for to short/long user input
const lenghtMsg = (min, max) => {
  "Eingabe darf nicht weniger als <strong>" +
    min +
    "</strong> und mehr als <strong>" +
    max +
    "</strong> Zeichen beinhalten";
};

// Handle validation errors
function checkResult(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // convert error object to array
    const messages = [];
    for (const [keys, value] of Object.entries(errors.array())) {
      messages.push(value.param + ": " + value.msg + "<br>");
    }
    // setup flash messages
    req.flash("error", messages);
    return res.redirect("back");
  }
  return next();
}

const validateUserData = [
  // setup validation chain
  body("email")
    .isEmail()
    .normalizeEmail()
    // ISSUE: emails ending with extra chars after ".org/.de" get accepted!
    // whitespace is needed otherwise different letters after ".or/.d" get accepted!
    // only allow bbs-me email accounts
    .matches(/@bbs-me.org *|@bbs-me.de */)
    .withMessage(
      "Email enspricht nicht dem Format <strong>@bbs-me.org/.de</strong>"
    ),
  body("group")
    .isLength({ min: 1, max: 7 })
    .withMessage(lenghtMsg(1, 7))
    .trim()
    .escape(),
  // validate result
  (req, res, next) => checkResult(req, res, next),
];

const validatePassword = [
  // setup validation chain
  body("password").isLength({ min: 1 }),
  body("passwordConfirmation").custom((value, { req }) => {
    if (value !== req.body.password) {
      req.flash("error", "Passwörter sind nicht gleich");
      return res.redirect("back");
    }
    return true;
  }),
  // validate result
  (req, res, next) => checkResult(req, res, next),
];

const validateItemData = [
  // setup validation chain
  body("name")
    .isLength({ min: 1, max: 30 })
    .withMessage(lenghtMsg(1, 30))
    .trim()
    .escape(),
  body("room")
    .isLength({ min: 1, max: 10 })
    .withMessage(lenghtMsg(1, 10))
    .trim()
    .escape(),
  body("shelf")
    .isLength({ min: 1, max: 10 })
    .withMessage(lenghtMsg(1, 10))
    .trim()
    .escape(),
  // validate result
  (req, res, next) => checkResult(req, res, next),
];

const validateCategoryData = [
  // setup validation chain
  body("name")
    .isLength({ min: 1, max: 30 })
    .withMessage(lenghtMsg(1, 30))
    .trim()
    .escape(),
  // validate result
  (req, res, next) => checkResult(req, res, next),
];

const validateURLData = [
  // setup validation chain
  body("techDocName")
    .isLength({ min: 1, max: 30 })
    .withMessage(lenghtMsg(1, 30))
    .trim()
    .escape(),
  body("techDocURL")
    // url must start with "https://"
    .matches(/^https:\/\//)
    .withMessage("Die URL muss mit <strong>https://</strong> beginnen")
    .trim(),
  // validate result
  (req, res, next) => checkResult(req, res, next),
];

module.exports = {
  validateUserData,
  validatePassword,
  validateItemData,
  validateCategoryData,
  validateURLData,
};
