/**
 * Endpoints that call CRUD controller functions and render Views to the User
 */

const router = require("express").Router();
// DB manipulation functions
const UserController = require("./controller.user");
const ItemController = require("../item/controller.item");
// Input data validation and sanitization
const {
  validateUserData,
  validatePassword,
} = require("../../middleware/validation");
// role based permission middleware
const permit = require("../../middleware/roles");
// cryptography functions
const { encryptPassword } = require("../../utils/cryptography");

/**
 * GET: Render a single user
 * POST: Render a list of specific users
 */
router
  .route("/:id")

  .get(async function (req, res) {
    // get specific user data
    const doc = await UserController.crud.getOne(req, res);
    const { rentedItems, rentedItemsHistory } =
      await ItemController.getUserFromItemDb(req.params.id);
    // render single user account
    res.render("display", {
      doc,
      rentedItems,
      rentedItemsHistory,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  })

  .post(permit("admin"), async function (req, res) {
    const doc = await UserController.crud.getMany(req, res);
    res.render("list", { doc });
  });

/**
 * GET: Render an Input-Form to the User
 * POST: Create DB entry, Render created user
 */
router
  .route("/form/add")

  .get(permit("admin"), function (req, res) {
    res.render("form.add.ejs", {
      form: "add.user",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  })

  .post(
    permit("admin"),
    validateUserData,
    validatePassword,
    async function (req, res) {
      // call create user controller
      if (await UserController.addUser(req)) {
        // setup notification and redirect
        req.flash("success", "Benutzer erfolgreich hinzugefügt");
      } else {
        req.flash("error", "Email Adresse ist bereits Regestriert");
      }
      res.redirect("back");
    }
  );

/**
 * POST: Update DB entry, Render updated user
 */
router
  .route("/update/:id")

  .post(permit("admin"), async function (req, res) {
    // call update controller
    await UserController.crud.updateOne(req, res);
    // setup notification and redirect
    req.flash("success", "Benutzer erfolgreich modifiziert");
    res.redirect("back");
  });

/**
 * POST: encrypt new password and store hash in DB
 */
router
  .route("/changepw/:id")

  .post(validatePassword, async function (req, res) {
    // encrypt new password
    const newHash = await encryptPassword(req.body.password);
    // call change password controller
    await UserController.changePassword(req.params.id, newHash);
    // setup notification and redirect
    req.flash("success", "Passwort erfolgreich geändert");
    res.redirect("back");
  });

/**
 * POST: Delete User entrys in Item DB, delete User from DB
 */
router
  .route("/delete/:id")

  .post(permit("admin"), async function (req, res) {
    await ItemController.deleteUserFromItemDb(req, res);
    await UserController.crud.removeOne(req, res);
    req.flash("success", "Benutzer erfolgreich gelöscht");
    res.redirect("/");
  });

module.exports = router;
