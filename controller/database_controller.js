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
            const [rows] = await userPromisePool.query('SELECT * FROM PET WHERE id = ?', req.params.id);
            res.json(rows);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error getting pet');
        }},
    getPetsbyUserID: async (req, res) => {
            try {
                const [rows] = await promiseUserPool.query('SELECT PET.Name FROM OWNERSHIP_INT JOIN PET ON OWNERSHIP_INT.PetID = PET.PetID WHERE OWNERSHIP_INT.UserID = ? ', [req.params.id]);
                if (rows.length > 0) {
                    const pet = rows[0]['Name'];
                    res.render("pets/pets_index", {pet: pet, showNavbar: true});
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