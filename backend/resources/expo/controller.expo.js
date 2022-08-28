// Datamodels
const ExpoModel = require("./model.expo");
// DB manipulation Functions
const crudControllers = require("../../utils/crud");
// general purpose middleware, used for QR code download
const path = require("path");
const fs = require("fs");

module.exports = {
  // general purpose CRUD functions
  crud: crudControllers(ExpoModel),

  /**
   * expo by division and sort by floor
   */
  expoByDivision: async () => {
    //
    try {
      const elektro = await ExpoModel.find({ division: "Elektro" })
        .lean()
        .sort({ floor: 1, name: 1 });
      const mechanik = await ExpoModel.find({ division: "Mechanik" })
        .lean()
        .sort({ floor: 1, name: 1 });
      const metall = await ExpoModel.find({ division: "Metall" })
        .lean()
        .sort({ floor: 1, name: 1 });

      return { elektro, mechanik, metall };
    } catch (err) {
      return res.send(err);
      // return res.redirect("back");
    }
  },

  /**
   * upload handout pdf
   */
  uploadFiles: async (req, res, id) => {
    //
    try {
      await ExpoModel.findByIdAndUpdate(id, {
        files: {
          handout: req.files["uploaded_pdf"][0].filename,
          img: req.files["uploaded_img"][0].filename,
        },
      });
    } catch (err) {
      return res.send(err);
      // return res.redirect("back");
    }
  },

  downloadQrCode: async (req, res) => {
    // get item data
    const doc = await ExpoModel.findById(req.params.id).lean();
    // create file
    fs.writeFile(
      doc.division + "-" + doc._id + ".svg",
      doc.qrSvg,
      function (err) {
        if (err) throw err;
        // create pathe to file location
        let filePath = path.join(
          __dirname,
          "../../../",
          doc.division + "-" + doc._id + ".svg"
        );
        // download file
        res.download(filePath, function (err) {
          if (err) throw err;
          // delete file
          fs.unlinkSync(filePath);
        });
      }
    );
  },
};
