// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated, isAdmin } = require("../middleware/checkAuth");
const { promiseUserPool } = require("../config/database");

router.get("/petProfile", ensureAuthenticated, (req, res) => {
    res.render("pets/pet_profile", {pet: "", showNavbar: true});
});



router.get("/petIndex/:userID", ensureAuthenticated, async (req, res) => {
    try {
        const [result] = await promiseUserPool.query('SELECT PET.Name FROM OWNERSHIP_INT JOIN PET ON OWNERSHIP_INT.PetID = PET.PetID WHERE OWNERSHIP_INT.UserID = ? ', [req.params.userID])
        console.log(result);
        pet = result[0]['Name'];
        res.render("pets/pets_index", {pet: pet, showNavbar: true});
    } catch (err) {
        console.error("Error getting: ", err);
    }
});

module.exports = router;
