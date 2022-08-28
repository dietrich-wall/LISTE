/**
 * Endpoints that call CRUD controller functions and render Views to the User
 */

const router = require("express").Router();
// DB manipulation Functions
const ExpoController = require("./controller.expo");
const UserController = require("../user/controller.user");
const checkAuthentication = require("../../middleware/authentication");
const permit = require("../../middleware/roles");
const { uploadExpoFiles } = require("../../middleware/multer");

// display overview of expo
router.get("/", async function (req, res) {
  const { elektro, mechanik, metall } = await ExpoController.expoByDivision();
  res.render("expo", {
    doc: { elektro, mechanik, metall },
    layout: "layouts/userNotLogged",
  });
});

// display single expo
router.get("/:id", async function (req, res) {
  const doc = await ExpoController.crud.getOne(req, res);
  res.render("display", {
    doc,
    layout: "layouts/userNotLogged",
  });
});

// LISTE intro
router.get("/intro/liste", function (req, res) {
  res.render("intro", {
    layout: "layouts/userNotLogged",
  });
});

// download qr code
router.get("/download/qr/:id", ExpoController.downloadQrCode);

// display add form
router.post(
  "/form",
  checkAuthentication,
  permit("student", "editor", "admin"),
  function (req, res) {
    res.render("form.add.ejs", {
      form: "add.expo",
      membersCount: req.body.membersCount,
    });
  }
);

// create DB entry
router.post(
  "/form/add",
  checkAuthentication,
  permit("student", "editor", "admin"),
  // upload.single("uploaded_file"),
  uploadExpoFiles.fields([{ name: "uploaded_pdf" }, { name: "uploaded_img" }]),
  async function (req, res) {
    const doc = await ExpoController.crud.createOne(req, res);
    if (doc) {
      ExpoController.uploadFiles(req, res, doc._id);
      // store expo id to user
      await UserController.addExpo(req, res, doc._id);
      res.redirect("/expo/" + doc._id);
    }
  }
);

// display edit form
router.post(
  "/form/edit",
  checkAuthentication,
  permit("student", "editor", "admin"),
  async function (req, res) {
    req.params.id = req.body.search;
    const doc = await ExpoController.crud.getOne(req, res);
    if (doc) {
      res.render("form.add.ejs", {
        doc,
        form: "edit.expo",
      });
    }
  }
);

// update DB entry
router.post(
  "/update/:id",
  checkAuthentication,
  permit("student", "editor", "admin"),
  uploadExpoFiles.fields([{ name: "uploaded_pdf" }, { name: "uploaded_img" }]),
  async function (req, res) {
    const doc = await ExpoController.crud.updateOne(req, res);
    if (doc) {
      ExpoController.uploadFiles(req, res, doc._id);
      // store expo id to user
      await UserController.addExpo(req, res, doc._id);
      res.redirect("/expo/" + doc._id);
    }
  }
);

// delete
router.post(
  "/delete/:id",
  checkAuthentication,
  permit("student", "editor", "admin"),
  async function (req, res) {
    await ExpoController.crud.removeOne(req, res);
    await UserController.removeExpo(req, res);
    req.flash("success", "Projektgruppe erfolgreich gelöscht");
    res.redirect("/");
  }
);

module.exports = router;
