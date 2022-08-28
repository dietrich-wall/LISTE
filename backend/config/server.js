////////////////////////////////////
// import librarys and modules
////////////////////////////////////

// nodejs library
const express = require("express");
// General purpose middleware
const path = require("path");
const flash = require("connect-flash");

// Session and Authentication middleware
const session = require("express-session");
const passport = require("passport");
const mongoStore = require("connect-mongo");

// View engine
require("ejs");
const expressLayouts = require("express-ejs-layouts");

// import routes
const expoRouter = require("../resources/expo/router.expo");
const authRouter = require("../index/router.auth");
const indexRouter = require("../index/router.index");
const itemRouter = require("../resources/item/router.item");
const userRouter = require("../resources/user/router.user");
const categoryRouter = require("../resources/category/router.category");

// authentication middleware
const checkAuthentication = require("../middleware/authentication");
const initPassport = require("../utils/passport");

// custom permission middleware
const permit = require("../middleware/roles");

// initialize passport
initPassport(passport);

////////////////////////////////////
// mount middleware to express
////////////////////////////////////
const app = express();

app.disable("x-powered-by");

// flash messages
app.use(flash());

// parse URL-encoded/JSON body-params and attach to reqest object
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set 'layout' directory for any views being rendered with res.render()
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../../frontend/views"));
app.use(expressLayouts);
app.set("layout", "layouts/userLogged");

// Require static assets from public folder
app.use(express.static(path.join(__dirname, "../../frontend/public")));

// enable user sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET, // TODO: change secret!
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({ mongoUrl: "mongodb://localhost/sessionDB" }),
  })
);
// make session middleware available to "Passport"
app.use(passport.session());
app.use(passport.authenticate("session"));
// initialize "Passport" Strategy and serialize/deserialize User
initPassport(passport);

// Final initialization of "Passport" authentication middleware
app.use(passport.initialize());

// setup routes
app.use("/expo", expoRouter);
app.use("/", authRouter);
app.use("/", checkAuthentication, permit("student", "editor", "admin"));
app.use("/", indexRouter);
app.use("/item", itemRouter);
app.use("/user", userRouter);
app.use("/category", categoryRouter);

module.exports = app;
