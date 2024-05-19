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

// edit pet info
// router.get('/petEdit/:id', ensureAuthenticated, (req, res) => {
//   res.redirect(`/petProfile/${req.params.id}/petEdit`);
// });
// router.get('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.getPetbyID, (req, res) => {
//   res.render('pets/edit_pet', 
//     {
//       pet: req.pet, 
//       med: req.pet.MedName,
//       medDesc: req.pet.MedDescription, 
//       cons: req.pet.BodyPart, 
//       symptoms: req.pet.Symptom,
//       consDesc: req.pet.ConDescription,
//       weight: req.pet.Weight, 
//       owner: req.pet.UserName,
//       showNavbar: true,
//     });
// });

// router.post('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.editPet);


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
      owner: req.pet.UserName,
      showNavbar: true,
    });
});

router.post('/petProfile/:id', ensureAuthenticated, databaseController.editPet);

// router.post('/petProfile/:id/petEdit', ensureAuthenticated, databaseController.getPetbyID);

module.exports = router;
