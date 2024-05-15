const { userPromisePool } = require('../config/database');

const databaseController = {
    createPet: async (req, res) => {
        const pet = {
            name: req.body.name,
            breed: req.body.breed,
            age: req.body.age,
            medical_history: req.body.medical_history,
            owner: req.body.owner
        };
        try {
            await userPromisePool.query('INSERT INTO pets SET ?', pet);
            res.redirect('/pets');
        } catch (error) {
            console.error(error);
            res.redirect('/pets');
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