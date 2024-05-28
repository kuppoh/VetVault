// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/checkAuth");

const databaseController = require("../controller/database_controller");

router.get('/petIndex/:id', ensureAuthenticated, databaseController.getPetsbyUserID, (req, res) => {
  res.render('pets/pets_index', {pets: req.pets});
});

router.get('/petIndex/', ensureAuthenticated, (req, res) => 
{
  res.redirect(`/petIndex/${req.user.id}`);
});

router.post('/deletePet/:id', ensureAuthenticated, databaseController.deletePet);

// getting pet profile
router.get('/petProfile/:id', ensureAuthenticated, databaseController.getPetbyID, databaseController.getLatestWeightCheck, databaseController.getPreivousWeightCheck, databaseController.getRemindersforPet, databaseController.getPrescriptionsForPet, (req, res) => {
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
      latestWeight: req.weight.Weight,
      latestWeightDate: req.weight.Date,
      previousWeight: req.prevWeight.Weight,
      previousWeightDate: req.prevWeight.Date,
      petInfo: req.petInfo,
      reminders: req.reminders,
      messages: req.messages,

      prescriptions: req.prescriptions,
    });
});


router.post('/petProfile/:id', ensureAuthenticated, databaseController.editPet);

// router.post('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.getPetbyID);

// editing pets
router.get('/petProfile/:id/edit', ensureAuthenticated, databaseController.getPetbyID, (req, res) => {
  res.render('pets/pet_edit', {pet: req.pet, petInfo: req.petInfo});
});

router.post('/petProfile/:id/edit', ensureAuthenticated, databaseController.editPet);
module.exports = router;
