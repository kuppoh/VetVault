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
            res.redirect('/pets/edit_pet');
        } catch (error) {
            console.error(error);
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
            const [rows] = await promiseUserPool.query(`
                SELECT P.*, M.MedName, M.Description as MedDescription, C.BodyPart, C.Symptom, C.Description as ConDescription, W.Weight, U.name as UserName
                FROM PET P
                LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID
                LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID
                LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID
                LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID
                LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID
                LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
                LEFT JOIN users U ON OI.UserID = U.ID
                WHERE P.PetID = ?
                `, petId);
    
            if (rows.length > 0) {
                const pet = rows[0];
                res.render('pets/pet_profile', 
                {
                    pet: pet, 
                    med: pet.MedName,
                    medDesc: pet.MedDescription, 
                    cons: pet.BodyPart, 
                    symptoms: pet.Symptom,
                    consDesc: pet.ConDescription,
                    weight: pet.Weight, 
                    owner: pet.UserName,
                    showNavbar: true,
                });

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