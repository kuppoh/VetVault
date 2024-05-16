// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require("../middleware/checkAuth");
const { promiseUserPool } = require("../config/database");
const databaseController = require("../controller/database_controller");

router.get('/petIndex/:id', ensureAuthenticated, databaseController.getPetsbyUserID);
router.get('/petProfile/:id', ensureAuthenticated, databaseController.getPetbyID);

module.exports = router;
