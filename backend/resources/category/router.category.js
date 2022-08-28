/**
 * Endpoints that call CRUD controller functions and render Views to the User
 */

const router = require("express").Router();
// DB manipulation functions
const { crud } = require("./controller.category");

// Input data validation and sanitization
const { validateCategoryData } = require("../../middleware/validation");
// role based permission middleware
const permit = require("../../middleware/roles");

/**
 * GET: Render a list of all main categories
 * POST: Render a list of all sub-subcategories
 */

router
  .route("/:id")

  .get(async function (req, res) {
    const doc = await crud.getMany(req, res);
    res.render("list", { doc });
  })

  .post(async function (req, res) {
    const doc = await crud.getMany(req, res);
    res.render("list", { doc });
  });

/**
 * GET: Render an Input-Form to the User
 * POST: Create DB entry, redirect to Form
 */
router
  .route("/form/add")

  .get(permit("admin", "editor"), async function (req, res) {
    const doc = await crud.getAll(req, res);
    res.render("form.add.ejs", {
      doc,
      form: "add.category",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  })

  .post(
    permit("admin", "editor"),
    validateCategoryData,
    async function (req, res) {
      await crud.createOne(req, res);
      // setup info message
      req.flash("success", "Kategorie erfolgreich hinzugefügt");
      res.redirect("back");
    }
  );

/**
 * POST: Update DB entry, Render updated category
 */
router
  .route("/update/:id")

  .put(permit("admin", "editor"), async function (req, res) {
    const doc = await crud.updateOne(req, res);
    res.render("list", { doc });
  });

/**
 * POST: Delete DB entry, Render delete category
 */
router
  .route("/delete/:id")

  .post(permit("admin"), async function (req, res) {
    const doc = await crud.removeOne(req, res);
    res.render("list", { doc });
  });

module.exports = router;
