/**
 * These functions manipulate Database entrys.
 *
 * CRUD is an acronym for: Create, Read, Update, Delete
 *
 *
 * All function follow the same try/catch(error) pattern:
 *
 * 1. await @param model to return DB entry and store as @const doc
 * 2. check if DB entry has NOT been found - @redirect "back" with flash message
 * 3. if @const doc is present @returns doc
 *
 */

// create single DB entry
function createOne(model) {
  return async (req, res) => {
    try {
      const doc = await model.create({ ...req.body });
      if (!doc) {
        req.flash("error", "creation failed");
        return res.redirect("/");
      }

      return doc;
    } catch (err) {
      const messages = [];
      for (const [keys, value] of Object.entries(err)) {
        messages.push(keys + ": " + value + "<br>");
      }
      req.flash("error", messages);
      return res.redirect("/");
    }
  };
}

// update single DB entry
function updateOne(model) {
  return async (req, res) => {
    try {
      const updatedDoc = await model
        .findOneAndUpdate(
          // search DB for id (This part is the query parameter)
          { _id: req.params.id },
          // update entry (This part gets changed)
          req.body,
          // return only the updated version
          { new: true }
        )
        .lean()
        .exec();
      if (!updatedDoc) {
        req.flash("error", "update failed");
        return res.redirect("/");
      }

      return updatedDoc;
    } catch (err) {
      req.flash("error", err);
      return res.redirect("/");
    }
  };
}

// remove single DB entry
function removeOne(model) {
  return async (req, res) => {
    try {
      const removedDoc = await model.findOneAndRemove({
        _id: req.params.id,
      });
      if (!removedDoc) {
        req.flash("error", "removing failed");
        return res.redirect("/");
      }

      return removedDoc;
    } catch (err) {
      req.flash("error", err);
      return res.redirect("/");
    }
  };
}

function getOne(model) {
  return async (req, res) => {
    try {
      // select query methode and find matching DB entry
      const doc = await model.findById(req.params.id).lean();
      if (!doc) {
        req.flash("error", "no match");
        return res.redirect("back");
      }

      return doc;
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  };
}

// query for all DB entry
function getAll(model) {
  return async (req, res) => {
    try {
      const doc = await model.find();
      if (!doc) {
        req.flash("error", "no match");
        return res.redirect("back");
      }
      return doc;
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  };
}

// query DB according to passed params or query variales
function getMany(model) {
  return async (req, res) => {
    try {
      const doc = await querySelector(req, model);
      if (!doc) {
        req.flash("error", "no match");
        return res.redirect("back");
      }
      return doc;
    } catch (err) {
      req.flash("error", err);
      return res.redirect("back");
    }
  };

  // select query method according to req.params
  function querySelector(req, model) {
    // return all subcategories
    if (req.params.id === "next") {
      return model
        .find({
          level: req.body.level,
          categoryTags: req.body.categoryTags,
        })
        .sort({ name: 1 });
      // return all main catergories
    } else if (req.params.id === "all") {
      return model.find({ level: 1 }).sort({ name: 1 });

      // return specific user (search by email or group)
    } else if (req.params.id === "user") {
      if (req.body.searchType === "email")
        return model.find({
          email: { $regex: new RegExp(req.body.search), $options: "i" },
        });
      if (req.body.searchType === "group")
        return model.find({
          group: { $regex: new RegExp(req.body.search), $options: "i" },
        });

      // return items specific (search by id or name)
    } else if (req.params.id === "items") {
      if (req.body.searchType === "id")
        return model.find({
          AlphNumId: { $regex: new RegExp(req.body.search), $options: "i" },
        });
      if (req.body.searchType === "name")
        return model.find({
          name: { $regex: new RegExp(req.body.search), $options: "i" },
        });

      // return items with specific category tag
    } else {
      return model.find({ categoryTags: req.params.id }).sort({ name: 1 });
    }
  }
}

module.exports = crudControllers = (model) => ({
  createOne: createOne(model),
  updateOne: updateOne(model),
  removeOne: removeOne(model),
  getOne: getOne(model),
  getAll: getAll(model),
  getMany: getMany(model),
});
