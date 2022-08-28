const mongoose = require("mongoose");
const qrCodeGen = require("../../utils/QRcodeGen/qrGen");

const ExpoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    // either "Elektro", "Metall", "Mechanik"
    division: { type: String, required: true },
    members: [{ type: String, required: true }],
    emails: [{ type: String, required: true }],
    description: { type: String, required: true },
    floor: { type: String, required: true },
    room: { type: String, required: true },
    qrSvg: { type: String, default: "" },
    files: {
      handout: { type: String },
      img: { type: String },
    },
    // createdBy: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "user",
    //   required: true,
    // },
  },
  { timestamps: true }
);

// Generate unique ID and QR Code
ExpoSchema.pre("save", function (next) {
  // Generate QR Code with new Item ID
  this.qrSvg = qrCodeGen("/expo/", this._id, "Forum22");
  next();
});

module.exports = mongoose.model("Expo", ExpoSchema);
