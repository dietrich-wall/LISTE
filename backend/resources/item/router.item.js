/**
 * Endpoints that call CRUD controller functions and render Views to the User
 */

const router = require("express").Router();
// DB manipulation Functions
const ItemController = require("./controller.item");
const UserController = require("../user/controller.user");
const CategoryController = require("../category/controller.category");
// Input data validation and sanitization
const {
  validateItemData,
  validateURLData,
} = require("../../middleware/validation");
// role based permission middleware
const permit = require("../../middleware/roles");
const { uploadItemImg } = require("../../middleware/multer");

/**
 * GET: Render a single item
 * POST: Render a list of specific items
 */
router
  .route("/:id")

  .get(async function (req, res) {
    const doc = await ItemController.crud.getOne(req, res);
    res.render("display", {
      doc,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  })

  .post(async function (req, res) {
    const doc = await ItemController.crud.getMany(req, res);
    res.render("list", { doc });
  });

/**
 * GET: Render an Input-Form
 * POST: Create item DB entry
 */
router
  .route("/form/add")

  .get(permit("admin", "editor"), async function (req, res) {
    const doc = await CategoryController.crud.getAll(req, res);
    res.render("form.add.ejs", {
      doc,
      form: "add.item",
      success: req.flash("success"),
      error: req.flash("error"),
    });
  })

  .post(
    permit("admin", "editor"),
    // validateItemData,
    uploadItemImg.single("uploaded_img"),
    async function (req, res) {
      req.body.img = req.file.filename;
      const doc = await ItemController.crud.createOne(req, res);
      req.flash("success", "Komponente erfolgreich hinzugefügt");
      res.redirect("/item/" + doc._id);
    }
  );

/**
 * POST: Update item data
 */
router
  .route("/update/:id")

  .post(permit("admin", "editor"), async function (req, res) {
    const doc = await ItemController.crud.getOne(req, res);
    if (req.body.room != doc.room) {
      req.body.currentLocation = req.body.room;
    }
    await ItemController.crud.updateOne(req, res);
    // setup info message
    req.flash("success", "Komponente erfolgreich modifiziert");
    res.redirect("back");
  });

/**
 * POST: Delete item
 */
router
  .route("/delete/:id")

  .post(permit("admin", "editor"), async function (req, res) {
    await ItemController.crud.removeOne(req, res);
    req.flash("success", "Komponente erfolgreich gelöscht");
    res.redirect("/");
  });

/**
 * POST: Add URL to item DB
 */
router
  .route("/addurl/:id")

  .post(permit("admin", "editor"), validateURLData, async function (req, res) {
    await ItemController.addURL(req);
    req.flash("success", "Link erfolgreich hinzugefügt");
    res.redirect("back");
  });

/**
 * GET: Download QR Code
 */
router.get("/download/:id", ItemController.downloadQrCode);

/**
 * POST: Rent Item
 */
router
  .route("/rent/:id")

  .post(async function (req, res) {
    // add item to user DB
    await UserController.updateRentedItems(req);
    // update location on item
    await ItemController.crud.updateOne(req, res);
    req.flash("success", "Komponente ausgeliehen");
    res.redirect("back");
  });

/**
 * POST: Return Item
 */
router
  .route("/return/:id")

  .post(async function (req, res) {
    // delete item from user DB
    await UserController.updateRentedItems(req);
    // update location
    await ItemController.return(req);
    // setup info message
    req.flash("success", "Komponente zurückgegeben");
    res.redirect("back");
  });

/**
 * POST: Send email with report, either "damaged" or "missing"
 */
router
  .route("/report/:item-:id")

  .post(async (req, res) => {
    // get email of reporting user and asign to req.body
    const { email } = await UserController.crud.getOne(req, res);
    req.body.email = email;
    // send reporting mail
    await ItemController.sendReportMail(req);
    req.flash("success", "Eine Meldung wurde abgegeben");
    res.redirect("back");
  });

module.exports = router;
