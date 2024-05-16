const { promiseUserPool } = require('../config/database');

const databaseController = {
    createPet: async (req, res) => {
        const pet = { // Will have to change based on the form that Kurtis makes
            name: req.body.name,
            breed: req.body.breed,
            age: req.body.age,
            medical_history: req.body.medical_history,
            owner: req.body.owner
        };
        try {
            await userPromisePool.query('INSERT INTO PET SET ?', pet);
            res.redirect('/pets');
        } catch (error) {
            console.error(error);
            res.redirect('/pets');
        }
    },
    editPet: async (req, res) => {
        const pet = { // Will have to change based on the form that Kurtis makes
            name: req.body.name,
            breed: req.body.breed,
            age: req.body.age,
            medical_history: req.body.medical_history,
            owner: req.body.owner
        };
        try {
            await userPromisePool.query('UPDATE PET SET ? WHERE id = ?', [pet, req.params.id]);
            res.redirect('/pets');
        } catch (error) {
            console.error(error);
            res.redirect('/pets');
        }
    },
    deletePet: async (req, res) => {
        try {
            await userPromisePool.query('DELETE FROM PET WHERE id = ?', req.params.id);
            res.redirect('/pets');
        } catch (error) {
            console.error(error);
            res.redirect('/pets');
        }
    },
    getPetbyID: async (req, res) => {
        try {
            const petId = req.params.id;
            const [petRows] = await promiseUserPool.query('SELECT * FROM PET WHERE PetID = ?', petId);
            const [medRows] = await promiseUserPool.query('SELECT * FROM PET_MED_INT JOIN PET ON PET_MED_INT.PetID = PET.PetID JOIN MEDICATION ON PET_MED_INT.MedID = MEDICATION.MedID WHERE PET.PetID = ?', petId);
            const [conRows] = await promiseUserPool.query('SELECT * FROM PET_CON_INT JOIN PET ON PET_CON_INT.PetID = PET.PetID JOIN `CONDITIONS` ON PET_CON_INT.ConditionID = `CONDITIONS`.ConditionID WHERE PET.PetID = ?', petId);
            const [weightRows] = await promiseUserPool.query('SELECT * FROM WEIGHTCHECK WHERE PetID = ?', petId);
            const [ownerRows] = await promiseUserPool.query('SELECT * FROM OWNERSHIP_INT JOIN users ON OWNERSHIP_INT.UserID = users.ID WHERE OWNERSHIP_INT.PetID = ?', petId);

            console.log(petRows);
            console.log(medRows);
            console.log(conRows);
            console.log(weightRows);
            console.log(ownerRows);
    
            if (petRows.length > 0) {
                const pet = petRows[0];
                
                pet.medications = medRows;
                const med = medRows[0]['MedName'];
                const medDesc = medRows[0]['Description'];
                
                pet.conditions = conRows;
                const cons = conRows[0]['BodyPart'];
                const symptoms = conRows[0]['Symptom'];
                const consDesc = conRows[0]['Description'];
                
                pet.weightChecks = weightRows;
                const weight = weightRows[0]['Weight'];
    
                const owner = ownerRows[0]['name'];
                res.render('pets/pet_profile', 
                {
                    pet: pet, 
                    med: med,
                    medDesc: medDesc, 
                    cons: cons, 
                    symptoms: symptoms,
                    consDesc: consDesc,
                    weight: weight, 
                    owner: owner,
                    showNavbar: true,

                }
                );
            } else {
                res.status(404).send('Pet not found');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting pet');
        }
    },
    getPetsbyUserID: async (req, res) => {
            try {
                const [rows] = await promiseUserPool.query('SELECT * FROM OWNERSHIP_INT JOIN PET ON OWNERSHIP_INT.PetID = PET.PetID WHERE OWNERSHIP_INT.UserID = ? ', [req.params.id]);
                if (rows.length > 0) {
                    res.render("pets/pets_index", {pets: rows, showNavbar: true});
                } else {
                    res.status(404).send('No pets found for this user');
                }
            } catch (error) {
                console.error(error);
                res.status(500).send('Error getting pets');
            }
        },
        // TODO: Create several functions to interact with the database
        // Pet functions
        // Create a new pet
        // Set Pet's medical history
        // Set Pet's owner
        // Set Pet's breed
        // Set Pet's age
        // User functions
        
    };
    
    

module.exports = databaseController;