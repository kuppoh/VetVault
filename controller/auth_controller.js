const { name } = require('ejs');
const { promiseUserPool } = require('../config/database'); // A connection pool for the MySQL database
const passport = require("../middleware/passport");
const bycrypt = require("bcrypt"); // Library for hashing passwords
const saltRounds = 10; // Number of rounds to use for the salt, salt is used to hash the password securely
// Salt rounds is the number of rounds the password hashing algorithm executes to hash the password
const { checkIfEmailExists } = require("../controller/database_controller");

let authController = {
  login: (req, res) => {
    res.render("auth/login", { role: 'user', name: 'Guest' });
  },

  register: (req, res) => {
    res.render("auth/register", { role: 'user', name: 'Guest', error: req.flash('error')});
  },

  loginSubmit: passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),

  registerSubmit: async (req, res) => {
    const email = req.body.email;
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      console.log("Email already exists");
      req.flash('error', 'Email already exists');
      res.redirect("/register");
      return;
    }

    const userPassword = req.body.password;
    const hashedPassword = await bycrypt.hash(userPassword, saltRounds) // Hash the password using bcrypt
    .then((hash) => {
      console.log("Hashed password: ", hash);
      return hash; // Return the hashed password
    })
    .catch((error) => {
      console.error("Error hashing password: ", error);
    });
    
    try {
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        phone_number: req.body.phone_number,
        password: hashedPassword, // Store the hashed password in the database
        role: "user",
        state: "unlocked"
      };
      console.log("Registering new user: ", newUser); // Log the new user in json format
      await promiseUserPool.query('INSERT INTO users SET ?', newUser); // Insert the new user into the database
      res.redirect("/login");
    } catch (error) {
      console.error(error);
      res.redirect("/register");
    }
  },

  logout: (req, res) => {
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/login');
      }
    });
  },
};

module.exports = authController;