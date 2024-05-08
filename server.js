const express = require('express');
const databaseRoute = require('./routes/databaseRoute');
const indexRoute = require('./routes/indexRoute');
const path = require("path");
const ejsLayouts = require("express-ejs-layouts");
const session = require("express-session");
const passport = require("./middleware/passport");
const { forwardAuthenticated } = require("./middleware/checkAuth");
const authController = require("./controller/auth_controller");
const fs = require('fs');
const app = express();

require('dotenv').config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
);

// Use EJS layouts for rendering views
app.use(ejsLayouts);

// Initialize stuff
app.use(passport.initialize());
app.use(passport.session());
app.use(indexRoute);
app.use(databaseRoute);
// Set the view engine to EJS
app.set("view engine", "ejs");


app.get("/auth/login", authController.login);

// Ignore for now
app.get("/register", authController.register);
app.get("/login", forwardAuthenticated, authController.login);
app.post("/register", authController.registerSubmit);
app.post("/login", authController.loginSubmit);
app.get("/logout", authController.logout);
app.post("/logout", authController.logout);
app.get("/test", (req, res) => { 
  res.send("Test page");
}
);
app.listen(3000, function () {
  console.log(
    "Server running. Visit: http://localhost:3000/login in your browser 🚀"
  );
});


