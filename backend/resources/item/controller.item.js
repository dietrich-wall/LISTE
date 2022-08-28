// Datamodels
const ItemModel = require("./model.item");
// DB manipulation Functions
const crudControllers = require("../../utils/crud");
// general purpose middleware, used for QR code download
const path = require("path");
const fs = require("fs");
// mailing function
const sendEmail = require("../../utils/emails");

module.exports = {
  // general purpose CRUD functions
  crud: crudControllers(ItemModel),

  addURL: async (req) => {
    // update link name
    await ItemModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: { techDocName: req.body.techDocName },
      },
      { new: true }
    )
      .lean()
      .exec();

    // update link URL
    await ItemModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: { techDocURL: req.body.techDocURL },
      },
      { new: true }
    )
      .lean()
      .exec();

    // return true if successful
    return true;
  },

  /**
   * Create "AlphNumId.svg" file from QRcode string
   * respond with download of created file
   */
  downloadQrCode: async (req, res) => {
    // get item data
    const doc = await ItemModel.findById(req.params.id).lean();
    // create file
    fs.writeFile(doc.AlphNumId + ".svg", doc.qrSvg, function (err) {
      if (err) throw err;
      // create pathe to file location
      let filePath = path.join(__dirname, "../../../", doc.AlphNumId + ".svg");
      // download file
      res.download(filePath, function (err) {
        if (err) throw err;
        // delete file
        fs.unlinkSync(filePath);
      });
    });
  },

  return: async (req) => {
    // update item
    await ItemModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: { currentLocation: req.body.homeLocation, isWith: null },

        $push: { wasWith: req.user._id },
      },
      { new: true }
    )
      .lean()
      .exec();
  },

  getUserFromItemDb: async (id) => {
    // get items the user is renting (not returned yet)
    const rentedItems = await ItemModel.find({ isWith: id });
    // get items the user has rented (returned)
    const rentedItemsHistory = await ItemModel.find({ wasWith: id });
    return { rentedItems, rentedItemsHistory };
  },

  deleteUserFromItemDb: async (req, res) => {
    // Delete user from item history
    try {
      await ItemModel.updateMany(
        { wasWith: req.params.id },
        {
          $pull: { wasWith: req.params.id },
        },
        { new: true }
      )
        .lean()
        .exec();
    } catch (error) {
      req.flash("error", err);
      return res.redirect("back");
    }

    // Find items the user still holds
    let leftoverItems = await ItemModel.find({ isWith: req.params.id });

    // reset "isWith" and "currentLocation" variables
    for (const key in leftoverItems) {
      await ItemModel.findByIdAndUpdate(
        leftoverItems[key]._id,
        {
          $set: { currentLocation: leftoverItems[key].room, isWith: null },
        },
        { new: true }
      )
        .lean()
        .exec();
    }
  },

  /**
   * Find rporting user and retrive email
   *
   * Missing: "user email" +  "item url"
   * Damaged: "user email" +  "item url"
   */
  sendReportMail: async (req) => {
    // send email and report damaged
    if (req.body.description != undefined) {
      sendEmail.reportDemaged(
        req.body.email,
        req.headers.referer,
        req.body.description
      );
    } else {
      // send email and report missing
      sendEmail.reportMissing(req.body.email, req.headers.referer);
    }
  },
};
