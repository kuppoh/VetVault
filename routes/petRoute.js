// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require("../middleware/checkAuth");
const { promiseUserPool } = require("../config/database");
const databaseController = require("../controller/database_controller");

router.get('/petIndex/:id', ensureAuthenticated, databaseController.getPetsbyUserID);

router.get('/petIndex/', ensureAuthenticated, (req, res) => 
{
  res.redirect(`/petIndex/${req.user.id}`);
});
// 

router.get('/petProfile/:id', ensureAuthenticated, databaseController.getPetbyID);

router.get('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.editPet);

module.exports = router;
