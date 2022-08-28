// upload files

// lib
const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Multer Filter
const expoFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "pdf") {
    cb(null, true);
  } else if (file.mimetype.split("/")[1] ? "jpeg" : "png") {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Flasches Format! Bitte nur .pdf, .jpeg oder .png Dateien Hochladen."
      ),
      false
    );
  }
};

//Configuration for Multer
const expoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let pathToFile = path.join(__dirname, "../../frontend/public/expo/files/");
    fs.mkdir(pathToFile, (err) => {
      cb(null, pathToFile);
    });
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${req.user.id}.${ext}`);
  },
});

//Configuration for Multer
const itemStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let pathToFile = path.join(__dirname, "../../frontend/public/items/img/");
    fs.mkdir(pathToFile, (err) => {
      cb(null, pathToFile);
    });
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const filename = req.user.id + "-" + Date.now() + "." + ext;
    cb(null, filename);
  },
});

module.exports = {
  uploadExpoFiles: multer({
    storage: expoStorage,
    fileFilter: expoFilter,
  }),

  uploadItemImg: multer({ storage: itemStorage }),
};
