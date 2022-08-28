// mongodb object-data-irgendwas-library
const mongoose = require("mongoose");

// define user model
const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // klassenkürzel
    group: { type: String, required: true },
    // expo created by this user
    expo: { type: String, default: "" },
    // other roles ("editor" and "admin") can be assigned by an admin
    role: { type: String, default: "student" },

    rentedItems: [{ type: String }],
    rentedItemsHistory: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
