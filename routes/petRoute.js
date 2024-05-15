// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require("../middleware/checkAuth");
const { promiseUserPool } = require("../config/database");
const databaseController = require("../controller/database_controller");
router.get("/petProfile", ensureAuthenticated, (req, res) => {
    res.render("pets/pet_profile", {pet: "", showNavbar: true});
});



router.get('/petIndex/:id', databaseController.getPetsbyUserID);

module.exports = router;
