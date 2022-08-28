const crudControllers = require("../../utils/crud");
const UserModel = require("./model.user");

// cryptography functions
const { encryptPassword } = require("../../utils/cryptography");

module.exports = {
  // general purpose CRUD functions
  crud: crudControllers(UserModel),

  findByEmail: async (req, res) => {
    try {
      return await UserModel.findOne({ email: req.body.email }).lean();
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  },

  changePassword: async (id, newHash) => {
    // update new password hash to DB
    try {
      const doc = await UserModel.findOneAndUpdate(
        { _id: id },
        { password: newHash },
        { new: true }
      );
      if (!doc) {
        req.flash("error", "Update failed");
        return res.redirect("back");
      }
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  },

  addUser: async (req) => {
    // check if user already exists
    if (await UserModel.findOne({ email: req.body.email })) {
      return false;
    }
    // hash user password
    req.body.password = await encryptPassword(req.body.password);
    // create DB entry
    try {
      const doc = await UserModel.create({ ...req.body });
      if (!doc) {
        return false;
      }
    } catch (error) {
      return false;
    }
    // return true if successful
    return true;
  },

  updateRentedItems: async (req) => {
    // update items rented array in user DB
    await UserModel.findByIdAndUpdate(
      req.body.isWith,
      {
        $push: { rentedItems: req.params.id },
      },
      { new: true }
    )
      .lean()
      .exec();
  },

  updateReturnedItems: async (req) => {
    // delete item from rented and push history
    await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { rentedItems: req.params.id },

        $push: { rentedItemsHistory: req.params.id },
      },
      { new: true }
    )
      .lean()
      .exec();
  },

  addExpo: async (req, res, expoId) => {
    try {
      const doc = await UserModel.findByIdAndUpdate(req.user.id, {
        $set: { expo: expoId },
      });

      if (!doc) {
        req.flash("error", "Update failed");
        return res.redirect("/");
      }
    } catch (error) {
      req.flash("error", "Update failed");
      return res.redirect("/");
    }
  },

  removeExpo: async (req, res) => {
    try {
      const doc = await UserModel.findOneAndUpdate(
        { expo: req.params.id },
        {
          $set: { expo: "" },
        }
      );

      if (!doc) {
        req.flash("error", "Update failed");
        return res.redirect("/");
      }
    } catch (error) {
      req.flash("error", "Update failed");
      return res.redirect("/");
    }
  },
};
