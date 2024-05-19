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
            await promiseUserPool.query('INSERT INTO PET SET ?', pet);
            res.redirect('/pets');
        } catch (error) {
            console.error(error);
            res.redirect('/pets');
        }
    },
    editPet: async (req, res) => {
        let Name = req.body.name;
        let Gender = req.body.gender;
        let Specie = req.body.specie;
        let Breed = req.body.breed;
        let Description = req.body.description;
        let MedName = req.body.medName;
        let MedDescription = req.body.medDescription;
        let BodyPart = req.body.bodyPart;
        let Symptom = req.body.symptom;
        let ConDescription = req.body.conDescription;
        let Weight = req.body.weight;
        let UserName = req.body.userName;
        let petId = req.params.id;

        try {
            console.log(Name, Gender, Specie, Breed, Description, MedName, MedDescription, BodyPart, Symptom, ConDescription, Weight, UserName, petId);

            const [rows] = await promiseUserPool.query("SELECT P.*, M.MedName, M.Description as MedDescription, C.BodyPart, C.Symptom, C.Description as ConDescription, W.Weight, U.name as UserName FROM PET P LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID LEFT JOIN users U ON OI.UserID = U.ID WHERE P.PetID = ?", [petId]);
            const currentInfo = rows[0];

            if (Name === "") {
                Name = currentInfo.Name;
            }
            if (Gender === "") {
                Gender = currentInfo.Gender;
            }
            if (Specie === "") {
                Specie = currentInfo.Specie;
            }
            if (Breed === "") {
                Breed = currentInfo.Breed;
            }
            if (Description === "") {
                Description = currentInfo.Description;
            }
            if (MedName === "") {
                MedName = currentInfo.MedName;
            }
            if (MedDescription === "") {
                MedDescription = currentInfo.MedDescription;
            }
            if (BodyPart === "") {
                BodyPart = currentInfo.BodyPart;
            }
            if (Symptom === "") {
                Symptom = currentInfo.Symptom;
            }
            if (ConDescription === "") {
                ConDescription = currentInfo.ConDescription;
            }
            if (Weight === "") {
                Weight = currentInfo.Weight;
            }
            if (UserName === "") {
                UserName = currentInfo.UserName;
            }

            await promiseUserPool.query(`
            UPDATE PET P
            LEFT JOIN PET_MED_INT PMI ON P.PetID = PMI.PetID
            LEFT JOIN MEDICATION M ON PMI.MedID = M.MedID
            LEFT JOIN PET_CON_INT PCI ON P.PetID = PCI.PetID
            LEFT JOIN CONDITIONS C ON PCI.ConditionID = C.ConditionID
            LEFT JOIN WEIGHTCHECK W ON P.PetID = W.PetID
            LEFT JOIN OWNERSHIP_INT OI ON P.PetID = OI.PetID
            LEFT JOIN users ON OI.UserID = users.id
            SET P.Name = ?,
                P.Gender = ?,
                P.Specie = ?,
                P.Breed = ?,
                P.Description = ?,
                M.MedName = ?,
                M.Description = ?,
                C.BodyPart = ?,
                C.Symptom = ?,
                C.Description = ?,
                W.Weight = ?,
                users.name = ?
            WHERE P.PetID = ?
        `, [Name, Gender, Specie, Breed, Description, MedName, MedDescription, BodyPart, Symptom, ConDescription, Weight, UserName, petId]);
            console.log("Pet Updated");
            res.redirect('/petProfile/' + petId);
        } catch (error) {
            console.error(error);
        }
    },
    deletePet: async (req, res) => {
        try {
            await promiseUserPool.query('DELETE FROM PET WHERE id = ?', req.params.id);
            res.redirect('/pets');
        } catch (error) {
            console.error(error);
            res.redirect('/pets');
        }
    },
    getPetbyID: async (req, res, next) => {
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
                req.pet = rows[0];
                next();
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
    checkIfEmailExists: async (email) => {
        const [rows] = await promiseUserPool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return true;
        } else {
            return false;
        }
    }
};

    
    

module.exports = databaseController;