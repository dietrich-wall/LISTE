const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "Kurzbeschreibung.." },

    // the level indicates the category rank
    // level 1 = Main category
    // level 2 = Sub category
    // level 3 = Manufacturer category
    level: { type: Number, required: true },

    // ObjectIDs of categorys linked to
    categoryTags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
