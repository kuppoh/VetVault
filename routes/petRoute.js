// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/checkAuth");

const databaseController = require("../controller/database_controller");

router.get('/petIndex/:id', ensureAuthenticated, databaseController.getPetsbyUserID);

router.get('/petIndex/', ensureAuthenticated, (req, res) => 
{
  res.redirect(`/petIndex/${req.user.id}`);
});

router.post('/deletePet/:id', ensureAuthenticated, databaseController.deletePet);

// getting pet profile
router.get('/petProfile/:id', ensureAuthenticated, databaseController.getPetbyID, (req, res) => {
  res.render('pets/pet_profile', 
    {
      pet: req.pet, 
      med: req.pet.MedName,
      medDesc: req.pet.MedDescription, 
      cons: req.pet.BodyPart, 
      symptoms: req.pet.Symptom,
      consDesc: req.pet.ConDescription,
      weight: req.pet.Weight, 
      weightDate: req.pet.Date,
      owner: req.pet.UserName,
      showNavbar: true,
    });
});

router.post('/petProfile/:id', ensureAuthenticated, databaseController.editPet);

// router.post('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.getPetbyID);

module.exports = router;
