const LocalStrategy = require("passport-local").Strategy;
const UserModel = require("../resources/user/model.user");
// cryptography functions
const { comparePassword } = require("../utils/cryptography");

module.exports = function initPassport(passport) {
  const authenticateUser = async (email, password, done) => {
    try {
      // find User in DB, return false if not found
      const user = await UserModel.findOne({ email: email }).exec();
      if (!user)
        return done(null, false, {
          message: "Benutzer nicht gefunden",
        });
      // if (!user.confirmed)
      //   return done(null, false, {
      //     message: "Bitte Regestrierung bestätigen",
      //   });
      // compare password with hash in DB
      const match = await comparePassword(password, user.password);
      // reutrn false if password donsn't match
      if (!match)
        return done(null, false, {
          message: "Password falsch",
        });
      // return user if all is well
      return done(null, user);
    } catch (error) {
      console.log(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModel.findById(id);
      if (!user)
        return done(null, false, {
          message: "Benutzer nicht gefunden",
        });
      if (user) return done(null, user);
    } catch (error) {
      console.log(error);
    }
  });
};
