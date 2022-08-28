const mongoose = require("mongoose");
// functions used in the pre save hook
const timeToAlphNumId = require("../../utils/alphnum");
const qrCodeGen = require("../../utils/QRcodeGen/qrGen");

const ItemSchema = new mongoose.Schema(
  {
    AlphNumId: { type: String, default: "" },
    qrSvg: { type: String, default: "" },

    name: { type: String, required: true },
    description: { type: String, default: "Kurzbeschreibung..." },

    categoryTags: [{ type: String }],

    img: { type: String },

    techDocName: [{ type: String }],
    techDocURL: [{ type: String }],

    room: { type: String, required: true },
    shelf: { type: String, required: true },
    currentLocation: { type: String },

    isWith: { type: String },
    wasWith: [{ type: String }],
  },
  { timestamps: true }
);

// Generate unique ID and QR Code
ItemSchema.pre("save", function (next) {
  // extract ObjectIDs timestamp value and use it to generate an Item ID
  this.AlphNumId = timeToAlphNumId(this._id.getTimestamp().getTime());

  // Generate QR Code with new Item ID
  this.qrSvg = qrCodeGen("/item/", this._id, this.AlphNumId);

  next();
});

// set currentLocation to room number
ItemSchema.pre("save", function (next) {
  this.currentLocation = this.room;
  next();
});

module.exports = mongoose.model("Item", ItemSchema);
