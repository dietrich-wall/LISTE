const mongoose = require("mongoose");
const db = process.env.MONGODB_URL;

module.exports = () => {
  mongoose
    .connect(db, {
      useNewUrlParser: true,
    })
    .then(() => {
      console.log("Connected to MongoDB on %s", db);
    })
    .catch((err) => console.log(err));
};
