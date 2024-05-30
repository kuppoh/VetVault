// Importing the necessary modules
const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../middleware/checkAuth");

const databaseController = require("../controller/database_controller");

router.get('/petIndex/:id', ensureAuthenticated, databaseController.getPetsbyUserID, (req, res) => {
  res.render('pets/pets_index', {pets: req.pets, petInfo: req.petInfo});
});

router.get('/petIndex/', ensureAuthenticated, (req, res) => 
{
  res.redirect(`/petIndex/${req.user.id}`);
});

router.post('/deletePet/:id', ensureAuthenticated, databaseController.deletePet);

// getting pet profile
router.get('/petProfile/:id', 
  ensureAuthenticated, 
  databaseController.getPetbyID, 
  databaseController.getLatestWeightCheck, 
  databaseController.getPreivousWeightCheck, 
  databaseController.getRemindersforPet, 
  databaseController.getPrescriptionsForPet, 
  (req, res) => {
    res.render('pets/pet_profile', {
      pet: req.pet || "No Pet Information", 
      med: req.pet?.MedName || "No Medication",
      medDesc: req.pet?.MedDescription || "No Medication Descriptions", 
      cons: req.pet?.BodyPart || "No Conditions", 
      symptoms: req.pet?.Symptom || "No Symptoms",
      consDesc: req.pet?.ConDescription || "No Conditions Descriptions",
      weight: req.pet?.Weight || "No Registered Weight", 
      weightDate: req.pet?.Date || "No Registered Date",
      owner: req.pet?.UserName || "No Owner",
      latestWeight: req.weight?.Weight || "No Latest Weight",
      latestWeightDate: req.weight?.Date || "No Latest Weight Date",
      previousWeight: req.prevWeight?.Weight || "No Previous Weight",
      previousWeightDate: req.prevWeight?.Date || "No Previous Weight Date",
      petInfo: req.petInfo || "No Pet Information",
      reminders: req.reminders || "No Reminders",
      messages: req.messages || "No Messages",
      petImage: req.petImage || "No Image",
      prescriptions: req.prescriptions || "No Prescriptions",
    });
  }
);


router.get('/createPrescription', ensureAuthenticated, databaseController.getPetsbyUserID, (req, res) => {
  res.render('pets/create_prescription', { pets: req.pets, pet: req.pet });
});
router.post('/createPrescription', ensureAuthenticated, databaseController.createPrescription);
router.post('/petProfile/:id', ensureAuthenticated, databaseController.editPet)
// router.post('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.getPetbyID);
router.get('/petCreate', ensureAuthenticated, (req, res) => {
  res.render('pets/create_pet');
});
router.post('/petCreate', ensureAuthenticated, databaseController.createPet);
// editing pets
router.get('/petProfile/:id/edit', ensureAuthenticated, databaseController.getPetbyID, (req, res) => {
  res.render('pets/pet_edit', {pet: req.pet, petInfo: req.petInfo});
});

router.post('/petProfile/:id/edit', ensureAuthenticated, databaseController.editPet);
module.exports = router;
